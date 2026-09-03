import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { mkdir } from '../src/mkdir.js';
import { catFiles } from '../src/cat.js';
import { expandPath } from '../src/utils.js';
import { getLanguage, highlightLine } from '../src/highlight.js';

export async function runBench() {
  console.log('=== bat-mkdir-cli bench ===\n');

  // 1) mkdir bench: 1000 nested dirs
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bat-bench-'));
  const startMkdir = process.hrtime.bigint();
  const totalMkdir = 1000;
  for (let i = 0; i < totalMkdir; i++) {
    const dir = path.join(tmpRoot, `a${i}/b/c`);
    await mkdir([dir]);
  }
  const mkdirMs = Number(process.hrtime.bigint() - startMkdir) / 1e6;
  console.log(`mkdir ${totalMkdir}x nested (a/b/c): ${mkdirMs.toFixed(1)} ms (${(mkdirMs/totalMkdir).toFixed(3)} ms/op)`);

  // 2) cat highlight bench: 20x 1MB file (reduced iterations for CI speed)
  const bigFile = path.join(tmpRoot, 'big.js');
  const oneMB = 'const a = 1;\nimport fs from "fs";\n// comment\n'.repeat(25000); // ~1MB ~75000 lines
  fs.writeFileSync(bigFile, oneMB);
  const stat = fs.statSync(bigFile);
  console.log(`\nbig file size: ${(stat.size/1024/1024).toFixed(2)} MB (${oneMB.split('\n').length} lines)`);
  const startCat = process.hrtime.bigint();
  const totalCat = 20;
  for (let i = 0; i < totalCat; i++) {
    await catFiles([bigFile], { silent: true, number: true, plain: false });
  }
  const catMs = Number(process.hrtime.bigint() - startCat) / 1e6;
  console.log(`cat highlight ${totalCat}x 1MB: ${catMs.toFixed(1)} ms (${(catMs/totalCat).toFixed(2)} ms/op, ${(stat.size*totalCat/1024/1024/(catMs/1000)).toFixed(1)} MB/s)`);

  // 3) plain vs highlight
  const startPlain = process.hrtime.bigint();
  for (let i = 0; i < totalCat; i++) {
    await catFiles([bigFile], { silent: true, plain: true });
  }
  const plainMs = Number(process.hrtime.bigint() - startPlain) / 1e6;
  console.log(`cat plain     ${totalCat}x 1MB: ${plainMs.toFixed(1)} ms (${(plainMs/totalCat).toFixed(2)} ms/op)`);

  // 4) utils bench: expandPath + getLanguage
  const startUtils = process.hrtime.bigint();
  const totalUtils = 100000;
  for (let i = 0; i < totalUtils; i++) {
    expandPath(`~/a/b/${i}`);
    getLanguage(`file${i}.js`);
    highlightLine(`const x = ${i}; // hello`, 'js');
  }
  const utilsMs = Number(process.hrtime.bigint() - startUtils) / 1e6;
  console.log(`\nutils ${totalUtils}x expand+lang+highlight: ${utilsMs.toFixed(1)} ms (${(utilsMs/totalUtils*1000).toFixed(2)} µs/op)`);

  // cleanup
  fs.rmSync(tmpRoot, { recursive: true, force: true });

  const total = mkdirMs + catMs + plainMs + utilsMs;
  console.log(`\n--- total: ${total.toFixed(1)} ms ---`);
  console.log('Bench complete. Lower is better. For CI, ensure mkdir < 1000ms/1000ops and cat < 20ms/op.');
  if (mkdirMs/totalMkdir > 2) console.warn('⚠ mkdir slower than expected (>2ms/op)');
  if (catMs/totalCat > 500) console.warn('⚠ cat highlight slower than expected (>500ms/op)');
  else console.log('✔ cat highlight performance OK (<500ms/op)');
  return { mkdirMs, catMs, plainMs, utilsMs };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('bench.js')) {
  runBench().catch(e => { console.error(e); process.exit(1); });
}
