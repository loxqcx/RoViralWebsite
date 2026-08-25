# RoViral configuration

This folder is the main customization surface for the website.

- `brand.js`: brand name, logo, hero image, Discord link, announcement, and footer copy.
- `home.js`: homepage hero, section headings, process steps, and final call to action.
- `services.js`: Services page hero, service descriptions, and deliverables.
- `packages.js`: Packages page hero, package cards, labels, pricing, inclusions, and note.
- `portfolio.js`: live Portfolio page headings, status text, and stat labels.
- `caseStudies.js`: Case Studies page headings, labels, buttons, and empty state.
- `team.js`: Team page hero and team members.
- `about.js`: About page hero, manifesto, values, and team call to action.
- `careers.js`: Careers page hero, open roles, apply label, and closing note.
- `contact.js`: Contact page copy, form options, status labels, and success message.
- `notFound.js`: 404 page copy.
- `games.js`: portfolio games, case-study visibility, place IDs, thumbnails, Roblox links, display order, and refresh behavior. Set `caseStudies` to `true` to include a game on the Case Studies page.
- `metrics.js`: homepage values for views, clients, and average reviews.
- `navigation.js`: header and mobile navigation links.
- `selectedWork.js`: static homepage Selected Work cards with a name, thumbnail, service label, and displayed stat.
- `server.js`: Discord mention IDs and public embed presentation settings. Never put the webhook URL here.
- `theme.css`: global brand colors.

The Discord webhook URL must remain in the server-side `DISCORD_WEBHOOK_URL` environment variable.
