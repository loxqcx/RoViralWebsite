# RoViral configuration

This folder is the main customization surface for the website.

- `brand.js`: brand name, logo, hero image, email, Discord link, announcement, and footer copy.
- `games.js`: portfolio games, place IDs, thumbnails, Roblox links, display order, and refresh behavior.
- `metrics.js`: homepage values for views, clients, and average reviews.
- `navigation.js`: header and mobile navigation links.
- `server.js`: Discord mention IDs and public embed presentation settings. Never put the webhook URL here.
- `site.js`: services, packages, portfolio, case studies, process, team, careers, and contact-form options.
- `theme.css`: global brand colors.

The Discord webhook URL must remain in the server-side `DISCORD_WEBHOOK_URL` environment variable.
