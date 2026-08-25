# RoViral Marketing Site

A configurable React/Vite marketing site with Vercel serverless contact delivery to Discord.

## Local setup

```bash
npm install
npm run dev
```

Vite serves the frontend locally. To exercise the serverless contact route locally, use the Vercel CLI with `vercel dev` and a local `DISCORD_WEBHOOK_URL` environment variable.

## Configuration

- Edit site content, links, services, packages, projects, team, roles, and form options in `src/config/site.js`.
- Change visual tokens at the top of `src/styles.css`.
- Add `DISCORD_WEBHOOK_URL` in Vercel Project Settings > Environment Variables.
- Optionally set `DISCORD_MENTION_IDS` as comma-separated Discord IDs.

The real webhook URL must never be added to source control or client-side code.

## Deploy

Import this repository into Vercel, add the environment variable, and deploy. `vercel.json` keeps client-side routes working on direct visits while preserving `/api/contact` as a serverless function.
