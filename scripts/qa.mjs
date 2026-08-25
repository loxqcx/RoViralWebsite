// Made by loxqcx on Discord.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { brandConfig } from '../src/config/brand.js';
import { gamesConfig } from '../src/config/games.js';
import { navigationConfig } from '../src/config/navigation.js';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('tmp/qa');
const expectedCaseStudies = gamesConfig.games.filter((game) => game.caseStudies === true).length;

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
    navLinks: document.querySelectorAll('.desktop-nav a').length,
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

  await visit(page, '/case-studies');
  if (expectedCaseStudies > 0) {
    await page.locator('.live-status--live').waitFor({ state: 'visible', timeout: 20_000 });
    await page.locator('.case-study-grid').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const image = document.querySelector('.case-study-media img');
      return image?.complete && image.naturalWidth > 0;
    });
  }
  const caseStudies = await page.evaluate(() => ({
    cards: document.querySelectorAll('.live-case-study').length,
    liveChips: document.querySelectorAll('.live-case-study .game-live-chip').length,
    imageLoaded: [...document.querySelectorAll('.case-study-media img')]
      .every((image) => image.complete && image.naturalWidth > 0),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: path.join(outputDir, `case-studies-${viewport.name}.png`), fullPage: false });

  await visit(page, '/careers');
  const careerLinks = await page.locator('.career-apply').evaluateAll((links) => links.map((link) => link.href));
  await page.locator('.careers-list').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(outputDir, `careers-${viewport.name}.png`), fullPage: false });

  await visit(page, '/contact');
  const fields = await page.locator('form input, form select, form textarea').count();
  await page.screenshot({ path: path.join(outputDir, `contact-${viewport.name}.png`), fullPage: false });

  if (viewport.name === 'mobile') {
    await visit(page);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menuVisible = await page.locator('.mobile-menu').isVisible();
    report.push({ viewport, home, packages, portfolio, caseStudies, careerLinks, fields, menuVisible, errors });
  } else {
    report.push({ viewport, home, packages, portfolio, caseStudies, careerLinks, fields, errors });
  }

  await page.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));

if (report.some((item) => item.errors.length
  || item.home.horizontalOverflow
  || !item.home.logoLoaded
  || item.home.navLinks !== navigationConfig.length
  || item.home.metricLabels.length !== 3
  || item.packages !== 3
  || item.portfolio.cards !== 1
  || item.portfolio.liveChips !== 1
  || !item.portfolio.visibleImagesLoaded
  || item.portfolio.horizontalOverflow
  || item.caseStudies.cards !== expectedCaseStudies
  || item.caseStudies.liveChips !== expectedCaseStudies
  || !item.caseStudies.imageLoaded
  || item.caseStudies.horizontalOverflow
  || item.careerLinks.length !== 3
  || item.careerLinks.some((url) => url !== brandConfig.discordUrl)
  || item.fields < 8
  || item.menuVisible === false)) {
  process.exitCode = 1;
}
