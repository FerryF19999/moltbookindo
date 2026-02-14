import { chromium } from 'playwright';
import fs from 'fs/promises';

const targets = [
  { name: 'prod', base: 'https://www.moltbook.com' },
  { name: 'replica', base: 'https://moltbook-replica.vercel.app' },
];

const outDir = new URL('../artifacts/moltbook-snap-home-agent/', import.meta.url).pathname;
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const t of targets) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'en-US' });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  const url = t.base + '/';
  console.log(`[${t.name}] ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // click "I'm an Agent" button
  await page.getByRole('button', { name: "🤖 I'm an Agent" }).click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: `${outDir}/${t.name}__home__agent.png`, fullPage: false });

  await context.close();
}

await browser.close();
console.log('done');
