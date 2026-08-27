# RoViral Marketing Site

A configurable React/Vite marketing site with live Roblox portfolio data, Discord-backed team profiles and reviews, and Vercel serverless delivery to Discord.

## Local setup

```bash
npm install
npm run dev
```

Vite serves the frontend and local API middleware. Copy `.env.example` to `.env.local` and replace the placeholders to test Discord features locally.

## Configuration

- Edit page content in the matching file under `src/config/`.
- Edit team names, roles, biographies, fallback usernames, and Discord user IDs in `src/config/team.js`.
- Change visual tokens at the top of `src/styles.css`.
- Add `DISCORD_WEBHOOK_URL` in Vercel Project Settings > Environment Variables.
- Optionally set `DISCORD_MENTION_IDS` as comma-separated Discord IDs.
- Add `DISCORD_BOT_TOKEN` to load Discord usernames and avatars on the team page.
- Add `DISCORD_REVIEW_CHANNEL_ID` to send and load moderated reviews. The configured default is the RoViral review channel.
- Add `DISCORD_HOME_STATS_CHANNEL_ID` to both Vercel and the bot host so `/homet` and `/homec` can update the homepage totals. Bot admin access is editable in `src/config/server.js` or with `DISCORD_BOT_ADMIN_IDS` on the bot host.

Real webhook URLs and bot tokens must never be added to source control or client-side code.

## Deploy

Import this repository into Vercel, add the environment variables, and deploy. Redeploy after changing an environment variable.

See [DISCORD_SETUP.md](DISCORD_SETUP.md) for team profile and bot presence setup.

See [BOT_HOSTING.md](BOT_HOSTING.md) for a persistent free-tier VM deployment with automatic crash and reboot recovery.
