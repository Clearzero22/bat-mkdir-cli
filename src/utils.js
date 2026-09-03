import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * Expand ~ and env vars, normalize
 */
export function expandPath(p) {
  if (!p) return p;
  let out = p;
  if (out.startsWith('~')) {
    out = path.join(os.homedir(), out.slice(1));
  }
  // expand %VAR% on Windows and $VAR
  out = out.replace(/%([^%]+)%/g, (_, n) => process.env[n] ?? `%${n}%`);
  out = out.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, n) => process.env[n] ?? `$${n}`);
  return path.normalize(out);
}

export function existsSync(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dir, opts = {}) {
  const target = expandPath(dir);
  const verbose = !!opts.verbose;
  const mode = opts.mode;
  await fs.promises.mkdir(target, { recursive: true, mode });
  if (verbose) {
    return { created: target, alreadyExists: false };
  }
  return { created: target };
}

export async function ensureDirSync(dir, opts = {}) {
  const target = expandPath(dir);
  fs.mkdirSync(target, { recursive: true, mode: opts.mode });
  return target;
}

export function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function elapsedMs(start) {
  const diff = process.hrtime.bigint() - start;
  return Number(diff) / 1e6;
}
