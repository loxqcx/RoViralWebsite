// Made by loxqcx on Discord.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('tmp/qa');

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const report = [];

const visit = async (page, pathname = '/') => {
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
};

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

  await visit(page);
  await page.screenshot({ path: path.join(outputDir, `home-${viewport.name}.png`), fullPage: false });

  const home = await page.evaluate(() => ({
    title: document.title,
    heading: document.querySelector('h1')?.innerText,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    navVisible: Boolean(document.querySelector('header')),
    logoLoaded: Boolean(document.querySelector('.brand-logo')?.complete && document.querySelector('.brand-logo')?.naturalWidth),
    metricLabels: [...document.querySelectorAll('.hero-stats span')].map((element) => element.textContent),
  }));

  await visit(page, '/packages');
  const packages = await page.locator('.package-card').count();
  await page.screenshot({ path: path.join(outputDir, `packages-${viewport.name}.png`), fullPage: false });

  await visit(page, '/portfolio');
  await page.locator('.live-status--live').waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('.live-games-grid').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const image = document.querySelector('.live-game-media img');
    return image?.complete && image.naturalWidth > 0;
  });
  const portfolio = await page.evaluate(() => ({
    cards: document.querySelectorAll('.live-game-card').length,
    liveChips: document.querySelectorAll('.game-live-chip').length,
    visibleImagesLoaded: [...document.querySelectorAll('.live-game-media img')]
      .slice(0, 1)
      .every((image) => image.complete && image.naturalWidth > 0),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: path.join(outputDir, `portfolio-${viewport.name}.png`), fullPage: false });

  await visit(page, '/contact');
  const fields = await page.locator('form input, form select, form textarea').count();
  await page.screenshot({ path: path.join(outputDir, `contact-${viewport.name}.png`), fullPage: false });

  if (viewport.name === 'mobile') {
    await visit(page);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menuVisible = await page.locator('.mobile-menu').isVisible();
    report.push({ viewport, home, packages, portfolio, fields, menuVisible, errors });
  } else {
    report.push({ viewport, home, packages, portfolio, fields, errors });
  }

  await page.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));

if (report.some((item) => item.errors.length
  || item.home.horizontalOverflow
  || !item.home.logoLoaded
  || item.home.metricLabels.length !== 3
  || item.packages !== 3
  || item.portfolio.cards !== 1
  || item.portfolio.liveChips !== 1
  || !item.portfolio.visibleImagesLoaded
  || item.portfolio.horizontalOverflow
  || item.fields < 8
  || item.menuVisible === false)) {
  process.exitCode = 1;
}
