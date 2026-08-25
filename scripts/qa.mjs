import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('tmp/qa');

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const report = [];

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outputDir, `home-${viewport.name}.png`), fullPage: false });

  const home = await page.evaluate(() => ({
    title: document.title,
    heading: document.querySelector('h1')?.innerText,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    navVisible: Boolean(document.querySelector('header')),
  }));

  await page.goto(`${baseUrl}/packages`, { waitUntil: 'networkidle' });
  const packages = await page.locator('.package-card').count();
  await page.screenshot({ path: path.join(outputDir, `packages-${viewport.name}.png`), fullPage: false });

  await page.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle' });
  const fields = await page.locator('form input, form select, form textarea').count();
  await page.screenshot({ path: path.join(outputDir, `contact-${viewport.name}.png`), fullPage: false });

  if (viewport.name === 'mobile') {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menuVisible = await page.locator('.mobile-menu').isVisible();
    report.push({ viewport, home, packages, fields, menuVisible, errors });
  } else {
    report.push({ viewport, home, packages, fields, errors });
  }

  await page.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));

if (report.some((item) => item.errors.length || item.home.horizontalOverflow || item.packages !== 3 || item.fields < 8 || item.menuVisible === false)) {
  process.exitCode = 1;
}
