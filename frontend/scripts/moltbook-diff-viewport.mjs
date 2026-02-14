import fs from 'fs/promises';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

// Viewport-only pixel diff for screenshots created by moltbook-snap-viewport.mjs
// Usage:
//   node frontend/scripts/moltbook-diff-viewport.mjs

const dir = new URL('../artifacts/moltbook-snap-viewport/', import.meta.url).pathname;
const outDir = new URL('../artifacts/moltbook-diff-viewport/', import.meta.url).pathname;
await fs.mkdir(outDir, { recursive: true });

const routes = [
  'home',
  'm',
  'search',
  'developers__apply',
  'help',
  'login',
  'humans__dashboard',
  'privacy',
  'terms',
  'u__gpt4',
  'does-not-exist-404-test',
];

const results = [];

for (const r of routes) {
  const aPath = path.join(dir, `prod__${r}.png`);
  const bPath = path.join(dir, `replica__${r}.png`);
  let aBuf, bBuf;
  try {
    [aBuf, bBuf] = await Promise.all([fs.readFile(aPath), fs.readFile(bPath)]);
  } catch (e) {
    results.push({ route: r, error: `missing screenshot: ${e.message}` });
    continue;
  }

  const a = PNG.sync.read(aBuf);
  const b = PNG.sync.read(bBuf);

  // Normalize size (should already match for viewport-only), but keep this robust.
  const w = Math.max(a.width, b.width);
  const h = Math.max(a.height, b.height);

  const pad = (img) => {
    if (img.width === w && img.height === h) return img;
    const out = new PNG({ width: w, height: h, fill: true });
    PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
    return out;
  };

  const aa = pad(a);
  const bb = pad(b);
  const diff = new PNG({ width: w, height: h });

  const diffPixels = pixelmatch(aa.data, bb.data, diff.data, w, h, {
    threshold: 0.1,
    includeAA: true,
  });

  const total = w * h;
  const pct = (diffPixels / total) * 100;
  const outPath = path.join(outDir, `diff__${r}.png`);
  await fs.writeFile(outPath, PNG.sync.write(diff));

  results.push({
    route: r,
    width: w,
    height: h,
    diffPixels,
    totalPixels: total,
    diffPct: +pct.toFixed(4),
    outPath,
  });
}

results.sort((x, y) => (y.diffPct ?? -1) - (x.diffPct ?? -1));
await fs.writeFile(path.join(outDir, 'diff-report.json'), JSON.stringify(results, null, 2));

// eslint-disable-next-line no-console
console.log('Diff report:');
for (const r of results) {
  if (r.error) console.log(`- ${r.route}: ERROR ${r.error}`);
  else console.log(`- ${r.route}: ${r.diffPct}% (${r.diffPixels}/${r.totalPixels})`);
}
