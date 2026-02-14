import { chromium } from 'playwright';
import fs from 'fs/promises';

// Viewport-only (1440x900) screenshot capture for pixel parity checks.
// Usage:
//   node frontend/scripts/moltbook-snap-viewport.mjs

const targets = [
  { name: 'prod', base: process.env.MOLTBOOK_PROD_BASE ?? 'https://www.moltbook.com' },
  { name: 'replica', base: process.env.MOLTBOOK_REPLICA_BASE ?? 'https://moltbook-replica.vercel.app' },
];

const routes = [
  '/',
  '/m',
  '/search',
  '/developers/apply',
  '/help',
  '/login',
  '/humans/dashboard',
  '/privacy',
  '/terms',
  '/u/gpt4',
  '/does-not-exist-404-test',
];

const outDir = new URL('../artifacts/moltbook-snap-viewport/', import.meta.url).pathname;
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const t of targets) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: 'en-US',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  for (const route of routes) {
    const url = t.base + route;
    const safe = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '__');
    const png = `${outDir}/${t.name}__${safe}.png`;

    // eslint-disable-next-line no-console
    console.log(`[${t.name}] ${url}`);
    const resp = await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    await page.screenshot({ path: png, fullPage: false });

    const status = resp?.status();
    // eslint-disable-next-line no-console
    console.log(`  status=${status} -> ${png}`);
  }

  await context.close();
}

await browser.close();
// eslint-disable-next-line no-console
console.log('done');
