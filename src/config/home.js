// Made by loxqcx on Discord.
import { homepageMetrics } from './metrics';

export const homePageConfig = {
  hero: {
    eyebrow: 'The attention layer for Roblox games',
    titleLines: ['Built to be', 'played. Made', 'to go viral.'],
    body: 'Strategy, short-form content, community, and trailers under one roof. We turn good Roblox games into launches people notice.',
    primaryCta: { label: 'Start a project', path: '/contact' },
    secondaryCta: { label: 'See our work', path: '/portfolio' },
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
  processSection: {
    eyebrow: 'How we work',
    title: ['Fast enough for culture.', 'Rigorous enough for growth.'],
    items: [
      { step: '01', title: 'Find the signal', text: 'We audit the game, audience, and current content to identify the strongest reason to care.' },
      { step: '02', title: 'Build the system', text: 'We turn that signal into repeatable formats, a channel plan, and a production rhythm.' },
      { step: '03', title: 'Ship and learn', text: 'Creative goes live quickly, then performance shapes the next round instead of sitting in a deck.' },
    ],
  },
  cta: {
    eyebrow: 'Got a game worth noticing?',
    titleLines: ['Bring the game.', "We'll bring the signal."],
    buttonLabel: 'Tell us about it',
    buttonPath: '/contact',
  },
};
