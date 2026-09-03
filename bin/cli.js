#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catFiles } from '../src/cat.js';
import { mkdir } from '../src/mkdir.js';
import { initProject, listTemplates } from '../src/init.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));

program
  .name('bat')
  .description('bat-mkdir-cli — cat with syntax highlighting + mkdir -p + project scaffolding (like bat)')
  .version(pkg.version, '-V, --version', 'output version')
  .helpOption('-h, --help', 'display help');

// bat cat <files> OR bat <files> (default)
// We support `bat cat file.js` and `bat file.js`
program
  .command('cat')
  .alias('c')
  .description('display file(s) with line numbers and syntax highlighting (like bat)')
  .argument('<files...>', 'files to display')
  .option('-n, --number', 'show line numbers', true)
  .option('--no-number', 'hide line numbers')
  .option('--plain', 'disable highlighting')
  .option('--no-header', 'hide file header')
  .option('--header', 'force header even for single file')
  .action(async (files, opts) => {
    await catFiles(files, {
      number: opts.number,
      plain: opts.plain,
      showHeader: opts.header !== false ? true : false,
      header: opts.header
    });
  });

program
  .command('mkdir')
  .alias('mk')
  .description('create directories recursively (like mkdir -p)')
  .argument('<dirs...>', 'directories to create')
  .option('-v, --verbose', 'verbose output')
  .option('-p, --parents', 'no error if existing, make parent dirs (default true)', true)
  .option('--dry-run', 'show what would be created')
  .option('-m, --mode <mode>', 'file mode (octal, e.g. 755)')
  .action(async (dirs, opts) => {
    const res = await mkdir(dirs, { verbose: opts.verbose || opts.dryRun, mode: opts.mode, dryRun: opts.dryRun });
    const created = res.filter(r => r.created).length;
    if (opts.verbose || opts.dryRun) {
      console.log(chalk.dim(`\n${created} created, ${res.length - created} existed`));
    }
  });

program
  .command('init')
  .alias('create')
  .description('scaffold a new project directory from template')
  .argument('<dir>', 'target directory (will be created)')
  .option('-t, --template <name>', `template name (${listTemplates().join('|') || 'basic'})`, 'basic')
  .option('--name <name>', 'project name (default: dir basename)')
  .option('-f, --force', 'overwrite if exists')
  .option('-v, --verbose', 'verbose')
  .option('--list-templates', 'list available templates')
  .action(async (dir, opts) => {
    if (opts.listTemplates) {
      console.log('Available templates:', listTemplates().join(', '));
      return;
    }
    await initProject(dir, {
      template: opts.template,
      name: opts.name,
      force: opts.force,
      verbose: opts.verbose
    });
  });

program
  .command('templates')
  .description('list available project templates')
  .action(() => {
    const tpls = listTemplates();
    console.log(chalk.bold('Available templates:'));
    tpls.forEach(t => console.log(' -', t));
  });

// Default action: if no subcommand but args look like files, act as cat
// e.g. `bat README.md` should cat
program
  .argument('[files...]', 'files to display (shorthand for cat)')
  .option('-n, --number', 'show line numbers')
  .option('--plain', 'disable highlighting')
  .option('--no-header', 'hide file header')
  .action(async (files, opts, cmd) => {
    // if subcommand was invoked, this default won't run with files? commander handles.
    // Check if a known subcommand was already executed – we detect by checking program args
    const rawArgs = process.argv.slice(2);
    const hasSub = ['cat','c','mkdir','mk','init','create','templates','--help','-h','--version','-v'].some(a => rawArgs.includes(a));
    if (hasSub) return;
    if (!files || files.length === 0) {
      program.help();
      return;
    }
    // treat as cat
    await catFiles(files, {
      number: opts.number !== false,
      plain: opts.plain,
      showHeader: true,
      header: false
    });
  });

program
  .command('bench')
  .description('run quick micro-benchmark (mkdir/cat)')
  .action(async () => {
    const { runBench } = await import('../bench/bench.js');
    await runBench();
  });

program.parseAsync().catch(err => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
