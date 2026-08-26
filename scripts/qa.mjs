// Made by loxqcx on Discord.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { brandConfig } from '../src/config/brand.js';
import { careersPageConfig } from '../src/config/careers.js';
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
    statuses: [...document.querySelectorAll('.service-strip .service-status')].map((element) => element.textContent.trim()),
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

  await visit(page, '/#reviews');
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: 'Leave a review' }).click();
  await page.locator('.review-form').waitFor({ state: 'visible' });
  const reviews = await page.evaluate(() => {
    const section = document.querySelector('#reviews');
    const rect = section?.getBoundingClientRect();
    return {
      sectionVisible: Boolean(section),
      anchorPosition: rect?.top ?? null,
      cards: document.querySelectorAll('.review-card').length,
      emptyVisible: Boolean(document.querySelector('.reviews-empty')),
      formFields: document.querySelectorAll('.review-form [name="discord"], .review-form [name="name"], .review-form [name="message"], .review-form [name="stars"]').length,
      reviewNavHref: [...document.querySelectorAll('.desktop-nav a')].find((link) => link.textContent.trim() === 'Reviews')?.getAttribute('href'),
      oldProcessPresent: Boolean(document.querySelector('.process-section')),
      oldCtaPresent: Boolean(document.querySelector('.home-cta')),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.screenshot({ path: path.join(outputDir, `reviews-${viewport.name}.png`), fullPage: false });

  const reviewApiUrl = `${baseUrl}/api/reviews`;
  await page.route(reviewApiUrl, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      reviews: [
        { id: 'qa-1', username: 'playerone', displayName: 'Player One', message: 'RoViral gave our launch a much stronger content direction and kept the process moving.', stars: 5, avatarUrl: '' },
        { id: 'qa-2', username: 'buildertwo', displayName: 'Builder Two', message: 'The team was responsive, organized, and easy to work with from start to finish.', stars: 4, avatarUrl: '' },
      ],
    }),
  }));
  await visit(page, '/?qa=review-marquee#reviews');
  await page.locator('.review-card').first().waitFor({ state: 'visible' });
  await page.locator('#reviews').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const reviewMarquee = await page.evaluate(() => ({
    cards: document.querySelectorAll('.review-card').length,
    groups: document.querySelectorAll('.reviews-group').length,
    animationName: getComputedStyle(document.querySelector('.reviews-track')).animationName,
    filledStars: document.querySelectorAll('.review-rating svg[fill="currentColor"]').length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: path.join(outputDir, `reviews-marquee-${viewport.name}.png`), fullPage: false });
  await page.unroute(reviewApiUrl);

  await visit(page, '/packages');
  const packages = await page.locator('.package-card').count();
  const packageActions = await page.locator('.package-card .button').evaluateAll((links) => links.map((link) => ({ href: link.href, text: link.textContent.trim() })));
  const packageCurrencies = await page.evaluate(() => ({
    usd: document.querySelectorAll('.package-card .package-currency').length,
    gbp: document.querySelectorAll('.package-card .package-price-gbp').length,
  }));
  const packageCards = page.locator('.package-card');
  const packageCard = packageCards.first();
  const cardRectBefore = await packageCard.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, x: rect.x, y: rect.y };
  });
  await packageCard.hover();
  await page.waitForTimeout(350);
  const cardRectAfter = await packageCard.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, x: rect.x, y: rect.y };
  });
  const packageCardHoverCorrect = viewport.name === 'desktop'
    ? cardRectAfter.width > cardRectBefore.width && cardRectAfter.y < cardRectBefore.y
    : Math.abs(cardRectAfter.width - cardRectBefore.width) < 0.5 && Math.abs(cardRectAfter.height - cardRectBefore.height) < 0.5;
  await page.locator('.package-note').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const image = document.querySelector('.package-note-icon');
    return image?.complete && image.naturalWidth > 0;
  });
  const customPackage = await page.evaluate(() => {
    const link = document.querySelector('.package-note .text-link');
    const image = document.querySelector('.package-note-icon');
    return {
      href: link?.href,
      icon: image?.getAttribute('src'),
      iconLoaded: Boolean(image?.complete && image.naturalWidth > 0),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.screenshot({ path: path.join(outputDir, `packages-${viewport.name}.png`), fullPage: false });

  await visit(page, '/services');
  await page.locator('.service-detail-list').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.service-detail .service-logo img')]
    .every((image) => image.complete && image.naturalWidth > 0));
  const services = await page.evaluate(() => ({
    logos: [...document.querySelectorAll('.service-detail .service-logo img')].map((image) => image.getAttribute('src')),
    statuses: [...document.querySelectorAll('.service-detail .service-status')].map((element) => element.textContent.trim()),
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
  await page.waitForFunction(() => [...document.querySelectorAll('.career-icon img')]
    .every((image) => image.complete && image.naturalWidth > 0));
  const careers = await page.evaluate(() => ({
    icons: [...document.querySelectorAll('.career-icon img')].map((image) => image.getAttribute('src')),
    borderedIcons: [...document.querySelectorAll('.career-icon')].filter((icon) => getComputedStyle(icon).borderStyle !== 'none').length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: path.join(outputDir, `careers-${viewport.name}.png`), fullPage: false });

  await visit(page, '/contact');
  const fields = await page.locator('form input, form select, form textarea').count();
  await page.screenshot({ path: path.join(outputDir, `contact-${viewport.name}.png`), fullPage: false });

  if (viewport.name === 'mobile') {
    await visit(page);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menuVisible = await page.locator('.mobile-menu').isVisible();
    report.push({ viewport, home, homeServices, homePackages, reviews, reviewMarquee, packages, packageActions, packageCurrencies, packageCardHoverCorrect, customPackage, services, staticPages, team, portfolio, caseStudies, careerLinks, careers, fields, menuVisible, errors });
  } else {
    report.push({ viewport, home, homeServices, homePackages, reviews, reviewMarquee, packages, packageActions, packageCurrencies, packageCardHoverCorrect, customPackage, services, staticPages, team, portfolio, caseStudies, careerLinks, careers, fields, errors });
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
  || item.homeServices.statuses.join('|') !== servicesPageConfig.services.filter((service) => service.status).map((service) => service.status).join('|')
  || item.homeServices.horizontalOverflow
  || item.homePackages.cards !== packagesPageConfig.packages.length
  || item.homePackages.actions.some((action) => action.href !== brandConfig.discordUrl || action.text !== packagesPageConfig.inquiryLabel)
  || item.homePackages.horizontalOverflow
  || !item.reviews.sectionVisible
  || item.reviews.anchorPosition === null
  || item.reviews.anchorPosition < 0
  || item.reviews.anchorPosition > 160
  || (!item.reviews.cards && !item.reviews.emptyVisible)
  || item.reviews.formFields !== 4
  || item.reviews.reviewNavHref !== '/#reviews'
  || item.reviews.oldProcessPresent
  || item.reviews.oldCtaPresent
  || item.reviews.horizontalOverflow
  || item.reviewMarquee.cards !== 8
  || item.reviewMarquee.groups !== 2
  || item.reviewMarquee.animationName !== 'review-marquee'
  || item.reviewMarquee.filledStars !== 36
  || item.reviewMarquee.horizontalOverflow
  || item.packages !== packagesPageConfig.packages.length
  || item.packageActions.some((action) => action.href !== brandConfig.discordUrl || action.text !== packagesPageConfig.inquiryLabel)
  || item.packageCurrencies.usd !== packagesPageConfig.packages.length
  || item.packageCurrencies.gbp !== packagesPageConfig.packages.length
  || !item.packageCardHoverCorrect
  || item.customPackage.href !== packagesPageConfig.note.linkUrl
  || item.customPackage.icon !== packagesPageConfig.note.icon
  || !item.customPackage.iconLoaded
  || item.customPackage.horizontalOverflow
  || item.services.logos.length !== servicesPageConfig.services.length
  || item.services.logos.some((logo, index) => logo !== servicesPageConfig.services[index].logo)
  || item.services.statuses.join('|') !== servicesPageConfig.services.filter((service) => service.status).map((service) => service.status).join('|')
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
  || item.careers.icons.length !== careersPageConfig.roles.length
  || item.careers.icons.some((icon, index) => icon !== careersPageConfig.roles[index].icon)
  || item.careers.borderedIcons
  || item.careers.horizontalOverflow
  || item.fields < 8
  || item.menuVisible === false)) {
  process.exitCode = 1;
}
