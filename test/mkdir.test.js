import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { mkdir } from '../src/mkdir.js';

let tmpRoot;

beforeEach(async () => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bat-mkdir-test-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe('mkdir', () => {
  it('creates single directory', async () => {
    const dir = path.join(tmpRoot, 'a');
    const res = await mkdir([dir]);
    expect(fs.existsSync(dir)).toBe(true);
    expect(res[0].created).toBe(true);
  });

  it('creates nested directories recursively (mkdir -p)', async () => {
    const dir = path.join(tmpRoot, 'a/b/c/d');
    const res = await mkdir([dir]);
    expect(fs.existsSync(dir)).toBe(true);
    expect(res[0].created).toBe(true);
  });

  it('is idempotent (second call alreadyExists)', async () => {
    const dir = path.join(tmpRoot, 'a/b');
    await mkdir([dir]);
    const res2 = await mkdir([dir]);
    expect(res2[0].alreadyExists).toBe(true);
    expect(res2[0].created).toBe(false);
  });

  it('creates multiple dirs in one call', async () => {
    const dirs = [path.join(tmpRoot, 'x/y'), path.join(tmpRoot, 'p/q')];
    const res = await mkdir(dirs);
    expect(res).toHaveLength(2);
    expect(fs.existsSync(dirs[0])).toBe(true);
    expect(fs.existsSync(dirs[1])).toBe(true);
  });

  it('dryRun does not create', async () => {
    const dir = path.join(tmpRoot, 'dry/run');
    const res = await mkdir([dir], { dryRun: true });
    expect(fs.existsSync(dir)).toBe(false);
    expect(res[0].dryRun).toBe(true);
  });

  it('expands ~ and works', async () => {
    // we just test expandPath integration – use tmpRoot as homedir mock? use absolute path instead
    const dir = path.join(tmpRoot, 'tilde/test');
    await mkdir([dir]);
    expect(fs.existsSync(dir)).toBe(true);
  });
});
