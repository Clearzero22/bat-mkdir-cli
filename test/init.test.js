import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { initProject, listTemplates } from '../src/init.js';

let tmpRoot;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bat-init-test-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe('initProject', () => {
  it('lists templates', () => {
    const tpls = listTemplates();
    expect(tpls).toContain('basic');
    expect(tpls).toContain('node-cli');
  });

  it('creates basic project', async () => {
    const dest = path.join(tmpRoot, 'my-app');
    const res = await initProject(dest, { template: 'basic', verbose: false });
    expect(fs.existsSync(dest)).toBe(true);
    expect(fs.existsSync(path.join(dest, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(dest, 'README.md'))).toBe(true);
    expect(fs.existsSync(path.join(dest, 'index.js'))).toBe(true);
    expect(res.files.length).toBeGreaterThan(2);
    const pkg = JSON.parse(fs.readFileSync(path.join(dest, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('my-app');
  });

  it('creates node-cli project', async () => {
    const dest = path.join(tmpRoot, 'my-cli');
    await initProject(dest, { template: 'node-cli' });
    expect(fs.existsSync(path.join(dest, 'bin/cli.js'))).toBe(true);
  });

  it('fails if dir exists and not empty without force', async () => {
    const dest = path.join(tmpRoot, 'exists');
    fs.mkdirSync(dest, { recursive: true });
    fs.writeFileSync(path.join(dest, 'file.txt'), 'hi');
    await expect(initProject(dest)).rejects.toThrow(/already exists/);
  });

  it('overwrites with force', async () => {
    const dest = path.join(tmpRoot, 'force-app');
    fs.mkdirSync(dest, { recursive: true });
    fs.writeFileSync(path.join(dest, 'file.txt'), 'hi');
    const res = await initProject(dest, { template: 'basic', force: true });
    expect(fs.existsSync(path.join(dest, 'package.json'))).toBe(true);
  });

  it('throws for unknown template', async () => {
    const dest = path.join(tmpRoot, 'bad');
    await expect(initProject(dest, { template: 'nope' })).rejects.toThrow(/Unknown template/);
  });

  it('renders {{name}} correctly', async () => {
    const dest = path.join(tmpRoot, 'render-test');
    await initProject(dest, { template: 'basic', name: 'awesome' });
    const readme = fs.readFileSync(path.join(dest, 'README.md'), 'utf8');
    expect(readme).toContain('awesome');
  });
});
