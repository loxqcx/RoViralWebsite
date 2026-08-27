# RoViral configuration

This folder is the main customization surface for the website.

- `brand.js`: brand name, logo, hero image, Discord link, announcement, and footer copy.
- `home.js`: homepage hero, service/package headings, and homepage calls to action.
- `reviews.js`: homepage review copy, form labels, marquee speed, moderation channel, reactions, and embed colors.
- `services.js`: Services page hero, service logo paths, descriptions, and deliverables. Service images live in `public/assets`.
- `packages.js`: Packages page hero, package cards, labels, pricing, inclusions, and note.
- `portfolio.js`: live Portfolio page headings, status text, and stat labels.
- `caseStudies.js`: Case Studies page headings, labels, buttons, and empty state.
- `team.js`: Team page hero and members, including Discord user IDs, fallback usernames, names, roles, initials, and bios.
- `about.js`: About page hero, manifesto, values, and team call to action.
- `careers.js`: Careers page hero, open roles, icon paths, apply label, and closing note.
- `contact.js`: Contact page copy, form options, status labels, and success message.
- `notFound.js`: 404 page copy.
- `games.js`: portfolio games, place IDs, thumbnails, Roblox links, display order, and refresh behavior.
- `metrics.js`: homepage metric defaults, Discord command labels, refresh timing, and count animation speed.
- `server.js`: Discord contact settings, the bot admin allowlist, and the homepage totals storage channel.
- `metrics.js`: homepage values for views, clients, and average reviews.
- `navigation.js`: header and mobile navigation links.
- `selectedWork.js`: optional static Selected Work card data retained for future use; the homepage currently displays packages instead.
- `server.js`: Discord mention IDs and public embed presentation settings. Never put the webhook URL here.
- `theme.css`: global brand colors.

Discord webhook URLs and bot tokens must remain in server-side environment variables. Never add them to a config file.
