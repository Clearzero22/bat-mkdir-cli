import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { expandPath, existsSync } from './utils.js';
import { mkdir } from './mkdir.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

export function listTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  return fs.readdirSync(TEMPLATES_DIR).filter(d => fs.statSync(path.join(TEMPLATES_DIR, d)).isDirectory());
}

function renderTemplate(content, vars) {
  return content.replace(/{{(\w+)}}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

export async function initProject(targetDir, opts = {}) {
  const template = opts.template || 'basic';
  const name = opts.name || path.basename(expandPath(targetDir));
  const vars = {
    name,
    description: opts.description || `Project ${name} created with bat-mkdir-cli`,
    author: opts.author || 'Anonymous',
    version: '0.1.0',
    year: String(new Date().getFullYear())
  };

  const dest = expandPath(targetDir);
  if (existsSync(dest) && !opts.force) {
    const stat = fs.statSync(dest);
    if (stat.isDirectory() && fs.readdirSync(dest).length > 0) {
      throw new Error(`Target directory already exists and not empty: ${dest} (use --force to overwrite)`);
    }
  }

  const tplDir = path.join(TEMPLATES_DIR, template);
  if (!fs.existsSync(tplDir)) {
    throw new Error(`Unknown template "${template}". Available: ${listTemplates().join(', ')}`);
  }

  await mkdir([dest], { verbose: opts.verbose });

  // copy and render
  const files = getAllFiles(tplDir);
  const created = [];
  for (const srcFile of files) {
    const rel = path.relative(tplDir, srcFile);
    // remove .tpl suffix for destination
    const destRel = rel.endsWith('.tpl') ? rel.slice(0, -4) : rel;
    // handle dotfiles: _gitignore -> .gitignore
    const finalRel = destRel.replace(/^_/, '.');
    const destFile = path.join(dest, renderTemplate(finalRel, vars));
    const destDir = path.dirname(destFile);
    await mkdir([destDir], {});
    let content = fs.readFileSync(srcFile, 'utf8');
    content = renderTemplate(content, vars);
    // if destination exists and not force, skip
    if (fs.existsSync(destFile) && !opts.force) {
      if (opts.verbose) console.log(chalk.yellow(`skip exists: ${destFile}`));
      continue;
    }
    fs.writeFileSync(destFile, content, 'utf8');
    created.push(path.relative(dest, destFile));
    if (opts.verbose) console.log(chalk.green(`created: ${destFile}`));
  }

  if (!opts.silent) {
    console.log(chalk.bold.green(`\n✔ Project "${name}" initialized at ${dest}`));
    console.log(chalk.dim(`  template: ${template}`));
    console.log(chalk.dim(`  files: ${created.join(', ')}`));
    console.log(chalk.cyan(`\n  Next: cd ${path.relative(process.cwd(), dest) || '.'} && npm install`));
  }

  return { dest, template, name, files: created };
}

function getAllFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...getAllFiles(full));
    else out.push(full);
  }
  return out;
}
