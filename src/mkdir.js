import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { expandPath } from './utils.js';

/**
 * mkdir -p like, but bat-style verbose output
 * @param {string[]} dirs
 * @param {object} opts { verbose, mode, dryRun }
 * @returns {Promise<Array<{path:string, created:boolean, alreadyExists:boolean}>>}
 */
export async function mkdir(dirs, opts = {}) {
  const verbose = !!opts.verbose;
  const dryRun = !!opts.dryRun;
  const mode = opts.mode ? parseInt(opts.mode, 8) : undefined;

  const results = [];
  for (const raw of dirs) {
    const dir = expandPath(raw);
    const exists = fs.existsSync(dir);
    if (dryRun) {
      results.push({ path: dir, created: !exists, alreadyExists: exists, dryRun: true });
      if (verbose) console.log(chalk.dim(`[dry-run] would create: ${dir}`));
      continue;
    }
    try {
      await fs.promises.mkdir(dir, { recursive: true, mode });
      const nowExists = fs.existsSync(dir);
      const wasCreated = !exists && nowExists;
      results.push({ path: dir, created: wasCreated, alreadyExists: exists && nowExists });
      if (verbose) {
        if (wasCreated) console.log(chalk.green(`created: ${dir}`));
        else console.log(chalk.yellow(`exists : ${dir}`));
      }
    } catch (e) {
      const msg = `mkdir: cannot create directory '${raw}': ${e.message}`;
      if (opts.throwOnError) throw new Error(msg);
      console.error(chalk.red(msg));
      results.push({ path: dir, error: msg });
    }
  }
  return results;
}

export function mkdirSync(dirs, opts = {}) {
  const results = [];
  for (const raw of dirs) {
    const dir = expandPath(raw);
    const exists = fs.existsSync(dir);
    fs.mkdirSync(dir, { recursive: true, mode: opts.mode ? parseInt(opts.mode, 8) : undefined });
    results.push({ path: dir, created: !exists });
  }
  return results;
}

export async function mkdirWithParents(dir, opts = {}) {
  return mkdir([dir], opts);
}
