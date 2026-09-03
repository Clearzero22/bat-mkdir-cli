import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { expandPath } from './utils.js';
import { highlightLine, getLanguage } from './highlight.js';
if (chalk.level === 0) chalk.level = 1;

export async function catFiles(files, opts = {}) {
  const {
    number = true,
    plain = false,
    showHeader = true,
    paging = false, // reserved
    encoding = 'utf8'
  } = opts;

  const results = [];
  for (const raw of files) {
    const file = expandPath(raw);
    let content;
    try {
      content = await fs.promises.readFile(file, encoding);
    } catch (e) {
      const msg = `bat: ${raw}: ${e.code || e.message}`;
      if (opts.throwOnError) throw new Error(msg);
      console.error(chalk.red(msg));
      results.push({ file, error: msg });
      continue;
    }
    const lang = getLanguage(file);
    const lines = content.split('\n');
    const width = String(lines.length).length;
    let out = '';
    if (showHeader && files.length > 1) {
      out += chalk.bold(`── ${file} ──`) + '\n';
    } else if (showHeader && files.length === 1) {
      // single file header optional – mimic bat's header when --file-name used
      // we show faint header only if opts.header
      if (opts.header) out += chalk.dim(`File: ${file}  [${lang}]`) + '\n';
    }
    for (let i = 0; i < lines.length; i++) {
      const n = i + 1;
      const line = lines[i];
      const highlighted = highlightLine(line, lang, { plain });
      if (number) {
        const numStr = String(n).padStart(width, ' ');
        const prefix = plain ? `${numStr} │ ` : chalk.gray(`${numStr} │ `);
        out += prefix + highlighted + '\n';
      } else {
        out += highlighted + '\n';
      }
    }
    // remove last newline added if original didn't end with newline
    if (!content.endsWith('\n') && out.endsWith('\n')) {
      out = out.slice(0, -1);
    }
    if (!opts.silent) {
      process.stdout.write(out);
      if (files.length > 1 && raw !== files[files.length - 1]) process.stdout.write('\n');
    }
    results.push({ file, content, rendered: out, lines: lines.length, lang });
  }
  return results;
}

export function catSync(files, opts = {}) {
  const results = [];
  for (const raw of files) {
    const file = expandPath(raw);
    const content = fs.readFileSync(file, 'utf8');
    results.push(content);
  }
  return results;
}
