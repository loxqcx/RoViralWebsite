// Made by loxqcx on Discord.
export const packagesPageConfig = {
  hero: {
    eyebrow: 'Packages',
    title: ['Pick the pace.', "We'll build the system."],
    body: 'Three starting points, shaped around the stage of your game. Scope and pricing stay custom because your launch should not look like everyone else\'s.',
    aside: 'No long-term lock-in. Clear deliverables before kickoff.',
  },
  packages: [
    {
      name: 'Launch',
      price: 'Custom',
      cadence: 'one-time sprint',
      description: 'A concentrated creative push for a new game, major update, or seasonal beat.',
      featured: false,
      includes: ['Growth audit', 'Launch strategy', '12 short-form videos', '1 launch trailer', 'Campaign report'],
    },
    {
      name: 'Momentum',
      price: 'Custom',
      cadence: 'monthly',
      description: 'An always-on content and community engine for teams ready to build compounding attention.',
      featured: true,
      includes: ['Content strategy and calendar', '20 short-form videos', 'Creator management', 'Community management', 'PTR creative testing', 'Weekly performance sync'],
    },
    {
      name: 'Studio+',
      price: 'Custom',
      cadence: 'monthly',
      description: 'A flexible embedded growth team across content, creative testing, launches, and community.',
      featured: false,
      includes: ['Everything in Momentum', 'High-volume content', 'Dedicated growth lead', 'Monthly trailers and teasers', 'Priority turnaround', 'Custom reporting'],
    },
  ],
  featuredLabel: 'Most popular',
  inquiryLabel: 'Learn more',
  note: {
    title: 'Need a single service?',
    body: 'Audits, trailers, and focused creative sprints are also available independently.',
    linkLabel: 'Build a custom scope',
    linkPath: '/contact',
  },
};
