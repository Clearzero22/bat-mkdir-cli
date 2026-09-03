import { describe, it, expect } from 'vitest';
import { expandPath, getLanguage } from '../src/utils.js';
import { getLanguage as gl } from '../src/highlight.js';

describe('utils', () => {
  it('expandPath handles ~', () => {
    const p = expandPath('~/test');
    expect(p).not.toContain('~');
  });
  it('getLanguage detects js', () => {
    expect(gl('a.js')).toBe('js');
    expect(gl('a.ts')).toBe('js');
    expect(gl('a.py')).toBe('py');
    expect(gl('a.json')).toBe('json');
    expect(gl('a.md')).toBe('md');
  });
});
