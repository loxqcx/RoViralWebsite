// Made by loxqcx on Discord.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { brandConfig } from '../src/config/brand.js';
import { gamesConfig } from '../src/config/games.js';
import { navigationConfig } from '../src/config/navigation.js';
import { packagesPageConfig } from '../src/config/packages.js';
import { servicesPageConfig } from '../src/config/services.js';
import { teamPageConfig } from '../src/config/team.js';

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
    bodyFont: getComputedStyle(document.body).fontFamily,
    headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
  }));

  await page.locator('.service-strips').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.service-strip .service-logo img')]
    .every((image) => image.complete && image.naturalWidth > 0));
  const homeServices = await page.evaluate(() => ({
    logos: [...document.querySelectorAll('.service-strip .service-logo img')].map((image) => image.getAttribute('src')),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: path.join(outputDir, `home-services-${viewport.name}.png`), fullPage: false });

  await page.locator('.home-packages').scrollIntoViewIfNeeded();
  const homePackages = await page.evaluate(() => ({
    cards: document.querySelectorAll('.home-packages .package-card').length,
    actions: [...document.querySelectorAll('.home-packages .package-card .button')].map((link) => ({ href: link.href, text: link.textContent.trim() })),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: path.join(outputDir, `home-packages-${viewport.name}.png`), fullPage: false });

  await visit(page, '/packages');
  const packages = await page.locator('.package-card').count();
  const packageActions = await page.locator('.package-card .button').evaluateAll((links) => links.map((link) => ({ href: link.href, text: link.textContent.trim() })));
  const packageCards = page.locator('.package-card');
  const packageCard = packageCards.first();
  const cardScaleBefore = await packageCard.evaluate((element) => getComputedStyle(element).scale);
  await packageCard.hover();
  await page.waitForTimeout(350);
  const cardScaleAfter = await packageCard.evaluate((element) => getComputedStyle(element).scale);
  const packageCardHoverCorrect = viewport.name === 'desktop' ? cardScaleAfter !== cardScaleBefore : cardScaleAfter === cardScaleBefore;
  await page.screenshot({ path: path.join(outputDir, `packages-${viewport.name}.png`), fullPage: false });

  await visit(page, '/services');
  await page.locator('.service-detail-list').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.service-detail .service-logo img')]
    .every((image) => image.complete && image.naturalWidth > 0));
  const services = await page.evaluate(() => ({
    logos: [...document.querySelectorAll('.service-detail .service-logo img')].map((image) => image.getAttribute('src')),
    headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: path.join(outputDir, `services-${viewport.name}.png`), fullPage: false });

  const staticPages = {};
  for (const pathname of ['/about', '/missing-page']) {
    await visit(page, pathname);
    staticPages[pathname] = await page.evaluate(() => ({
      heading: document.querySelector('h1')?.textContent.trim(),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
  }

  await visit(page, '/team');
  await page.locator('.team-card').first().waitFor({ state: 'visible' });
  const team = await page.evaluate(() => ({
    cards: document.querySelectorAll('.team-card').length,
    handles: [...document.querySelectorAll('.team-discord-handle')].map((element) => element.textContent.trim()),
    portraits: document.querySelectorAll('.team-avatar, .team-avatar-fallback').length,
    brokenImages: [...document.querySelectorAll('.team-avatar')].filter((image) => image.complete && !image.naturalWidth).length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: path.join(outputDir, `team-${viewport.name}.png`), fullPage: false });

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
    report.push({ viewport, home, homeServices, homePackages, packages, packageActions, packageCardHoverCorrect, services, staticPages, team, portfolio, caseStudies, careerLinks, fields, menuVisible, errors });
  } else {
    report.push({ viewport, home, homeServices, homePackages, packages, packageActions, packageCardHoverCorrect, services, staticPages, team, portfolio, caseStudies, careerLinks, fields, errors });
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
  || !item.home.bodyFont.includes('Outfit')
  || !item.home.headingFont.includes('Outfit')
  || item.homeServices.logos.length !== servicesPageConfig.services.length
  || item.homeServices.logos.some((logo, index) => logo !== servicesPageConfig.services[index].logo)
  || item.homeServices.horizontalOverflow
  || item.homePackages.cards !== packagesPageConfig.packages.length
  || item.homePackages.actions.some((action) => action.href !== brandConfig.discordUrl || action.text !== packagesPageConfig.inquiryLabel)
  || item.homePackages.horizontalOverflow
  || item.packages !== 3
  || item.packageActions.some((action) => action.href !== brandConfig.discordUrl || action.text !== packagesPageConfig.inquiryLabel)
  || !item.packageCardHoverCorrect
  || item.services.logos.length !== servicesPageConfig.services.length
  || item.services.logos.some((logo, index) => logo !== servicesPageConfig.services[index].logo)
  || !item.services.headingFont.includes('Outfit')
  || item.services.horizontalOverflow
  || Object.values(item.staticPages).some((page) => !page.heading || page.horizontalOverflow)
  || item.team.cards !== teamPageConfig.members.length
  || item.team.handles.length !== teamPageConfig.members.length
  || item.team.handles.some((handle) => !handle.startsWith('@') || !handle.endsWith(' on Discord'))
  || item.team.portraits !== teamPageConfig.members.length
  || item.team.brokenImages
  || item.team.horizontalOverflow
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
