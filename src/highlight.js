import chalk from 'chalk';
import path from 'node:path';
// Force color for test/CI environments where TTY is not detected
if (chalk.level === 0) chalk.level = 1;

// very lightweight syntax highlighter – no heavy deps for performance
const JS_KEYWORDS = new Set(['import','export','from','const','let','var','function','class','async','await','return','if','else','for','while','switch','case','break','continue','try','catch','finally','throw','new','extends','super','this','typeof','instanceof','in','of','default','yield','static','get','set','constructor']);
const PY_KEYWORDS = new Set(['def','class','import','from','return','if','elif','else','for','while','try','except','finally','with','as','lambda','yield','async','await','pass','break','continue','raise','in','is','not','and','or','True','False','None']);
const JSON_TOKENS = /(("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?=\s*:))|("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")|(\b(true|false|null)\b)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?))/g;

function highlightJS(line) {
  // highlight strings, comments, keywords, numbers
  // order: comments first to avoid inside-comment highlighting
  const commentIdx = line.indexOf('//');
  let code = line;
  let comment = '';
  if (commentIdx !== -1) {
    // naive: ignore // inside string – acceptable for demo
    code = line.slice(0, commentIdx);
    comment = line.slice(commentIdx);
  }
  // strings
  code = code.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, m => chalk.green(m));
  // numbers
  code = code.replace(/\b(\d+\.?\d*)\b/g, m => chalk.yellow(m));
  // keywords
  code = code.replace(/\b([A-Za-z_]\w*)\b/g, (m) => JS_KEYWORDS.has(m) ? chalk.cyan(m) : m);
  if (comment) comment = chalk.gray(comment);
  return code + comment;
}

function highlightPY(line) {
  const hashIdx = line.indexOf('#');
  let code = line;
  let comment = '';
  if (hashIdx !== -1) {
    code = line.slice(0, hashIdx);
    comment = chalk.gray(line.slice(hashIdx));
  }
  code = code.replace(/(['"])(?:(?=(\\?))\2.)*?\1/g, m => chalk.green(m));
  code = code.replace(/\b(\d+\.?\d*)\b/g, m => chalk.yellow(m));
  code = code.replace(/\b([A-Za-z_]\w*)\b/g, (m) => PY_KEYWORDS.has(m) ? chalk.cyan(m) : m);
  return code + comment;
}

function highlightJSON(line) {
  return line.replace(JSON_TOKENS, (match, key, _k2, str, _s2, boolNull) => {
    if (key) return chalk.cyan(key);
    if (str) return chalk.green(str);
    if (boolNull) return chalk.magenta(boolNull);
    if (/^-?\d/.test(match)) return chalk.yellow(match);
    return match;
  });
}

function highlightGeneric(line) {
  // just strings + numbers + comments
  let out = line.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, m => chalk.green(m));
  out = out.replace(/\b(\d+\.?\d*)\b/g, m => chalk.yellow(m));
  // highlight # and // comments
  if (out.trimStart().startsWith('#')) return chalk.gray(out);
  const idx = out.indexOf('//');
  if (idx !== -1) {
    return out.slice(0, idx) + chalk.gray(out.slice(idx));
  }
  return out;
}

export function getLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.js','.mjs','.cjs','.ts','.mts','.cts','.jsx','.tsx'].includes(ext)) return 'js';
  if (['.py','.pyw'].includes(ext)) return 'py';
  if (['.json','.jsonc'].includes(ext)) return 'json';
  if (['.md','.markdown'].includes(ext)) return 'md';
  if (['.sh','.bash','.zsh'].includes(ext)) return 'sh';
  if (['.ps1','.psm1'].includes(ext)) return 'ps1';
  if (['.yaml','.yml'].includes(ext)) return 'yaml';
  return 'generic';
}

export function highlightLine(line, lang, opts = {}) {
  if (opts.plain) return line;
  switch (lang) {
    case 'js': return highlightJS(line);
    case 'py': return highlightPY(line);
    case 'json': return highlightJSON(line);
    case 'md': return chalk.white(line); // markdown could be enhanced
    default: return highlightGeneric(line);
  }
}

export function highlightContent(content, filePath, opts = {}) {
  const lang = getLanguage(filePath);
  return content.split('\n').map(l => highlightLine(l, lang, opts)).join('\n');
}
