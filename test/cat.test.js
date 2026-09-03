import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { catFiles } from '../src/cat.js';

let tmpRoot;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bat-cat-test-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe('catFiles', () => {
  it('reads single file and returns lines', async () => {
    const file = path.join(tmpRoot, 'hello.js');
    fs.writeFileSync(file, 'const a = 1;\nconsole.log(a);\n');
    const res = await catFiles([file], { silent: true, number: false, plain: true });
    expect(res).toHaveLength(1);
    expect(res[0].content).toContain('const a');
    expect(res[0].lines).toBe(3); // includes trailing empty after split? check: 'a\nb\n' => ['a','b',''] => 3
  });

  it('handles line numbers', async () => {
    const file = path.join(tmpRoot, 'a.txt');
    fs.writeFileSync(file, 'line1\nline2');
    const res = await catFiles([file], { silent: true, number: true, plain: true });
    expect(res[0].rendered).toContain('1 │ line1');
    expect(res[0].rendered).toContain('2 │ line2');
  });

  it('highlights JS keywords (chalk codes)', async () => {
    const file = path.join(tmpRoot, 'test.js');
    fs.writeFileSync(file, 'import fs from "fs";\nconst x = 42;');
    const res = await catFiles([file], { silent: true, number: false, plain: false });
    // chalk adds ANSI escape \x1b[
    expect(res[0].rendered).toMatch(/\x1b\[/);
  });

  it('handles multiple files', async () => {
    const f1 = path.join(tmpRoot, 'a.txt');
    const f2 = path.join(tmpRoot, 'b.txt');
    fs.writeFileSync(f1, 'hello');
    fs.writeFileSync(f2, 'world');
    const res = await catFiles([f1, f2], { silent: true, plain: true });
    expect(res).toHaveLength(2);
    expect(res[0].content).toBe('hello');
    expect(res[1].content).toBe('world');
  });

  it('reports error for missing file', async () => {
    const missing = path.join(tmpRoot, 'nope.txt');
    const res = await catFiles([missing], { silent: true });
    expect(res[0].error).toMatch(/ENOENT|bat:/);
  });

  it('plain vs highlighted', async () => {
    const file = path.join(tmpRoot, 'c.json');
    fs.writeFileSync(file, '{"a": 1}');
    const plain = await catFiles([file], { silent: true, plain: true });
    const high = await catFiles([file], { silent: true, plain: false });
    expect(plain[0].rendered).not.toMatch(/\x1b\[/);
    expect(high[0].rendered).toMatch(/\x1b\[/);
  });
});
