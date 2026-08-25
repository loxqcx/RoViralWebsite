// Made by loxqcx on Discord.
import { homepageMetrics } from './metrics';

export const homePageConfig = {
  hero: {
    eyebrow: 'The attention layer for Roblox games',
    titleLines: ['Built to be', 'played. Made', 'to go viral.'],
    body: 'Strategy, short-form content, community, and trailers under one roof. We turn good Roblox games into launches people notice.',
    primaryCta: { label: 'Start a project', path: '/contact' },
    secondaryCta: { label: 'See our work', path: '/portfolio' },
    reviewsCta: { label: 'Reviews', path: '/#reviews' },
    stats: homepageMetrics,
  },
  servicesSection: {
    eyebrow: 'What we do',
    title: ['One team. Every', 'attention lever.'],
    body: 'We connect the parts that usually get scattered across freelancers, creators, and community teams.',
  },
  packagesSection: {
    eyebrow: 'Packages',
    title: ['Choose your pace.', 'Keep the momentum.'],
    body: 'Three flexible starting points for launches, ongoing growth, and teams that need a complete attention engine.',
    buttonLabel: 'Explore packages',
    buttonPath: '/packages',
  },
};
