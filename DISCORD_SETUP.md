# Discord Setup

## What It Does

The team page keeps the member's public name, role, biography, and fallback username in `src/config/team.js`. It sends only the configured Discord user IDs to `/api/discord-users`. That server route uses the private bot token to retrieve each public Discord username and avatar, then returns only the safe profile fields needed by the page.

The bot token never reaches the browser. If Discord or the API is unavailable, the configured initials and fallback username are shown instead.

## Create The Bot

1. Open the Discord Developer Portal and create an application.
2. Open **Bot**, create the bot user, and copy or reset its token.
3. Open **Installation** and install the app into the RoViral Discord server with the `bot` scope. Discord includes the `applications.commands` scope with it. The profile lookup, Online worker, and `/test` command do not need privileged intents.
4. Never paste the token into a config file, commit, or chat message.

## Configure Vercel

Add these in **Vercel > Project > Settings > Environment Variables**:

```text
DISCORD_BOT_TOKEN=your_private_bot_token
DISCORD_WEBHOOK_URL=your_private_contact_webhook
DISCORD_MENTION_IDS=1338968623095615508,898661166727962626,860461244627419138
```

Apply them to the environments you use and redeploy. Vercel uses `DISCORD_BOT_TOKEN` only for the `/api/discord-users` profile route.

## Edit Team Members

Each object in `src/config/team.js` supports:

```js
{
  discordUserId: '1338968623095615508',
  discordUsername: 'loxqcx',
  name: 'Erik',
  role: 'Founder / Growth Strategy',
  initials: 'E',
  bio: 'Short team biography.',
}
```

`name`, `role`, and `bio` are always controlled by the config. `discordUserId` retrieves the live avatar and global Discord username. `discordUsername` and `initials` are fallbacks.

## Keep The Bot Online

Discord presence needs a process that stays connected to Discord's Gateway. Vercel hosts the website and short API requests, but it is not the correct host for this continuous process.

Deploy this repository to a persistent worker service such as Railway, Render Background Worker, Fly.io, or a VPS. Configure it with:

```text
Start command: npm run bot
DISCORD_BOT_TOKEN=your_private_bot_token
DISCORD_BOT_ACTIVITY=RoViral Marketing
DISCORD_GUILD_ID=your_discord_server_id
```

The worker displays the bot as Online with the activity `Watching RoViral Marketing`. Changing `DISCORD_BOT_ACTIVITY` changes that text. A host that sleeps or stops the worker will make the bot appear Offline.

When the worker starts, it also registers `/test`. Running the command makes the bot reply `lox test successful`. `DISCORD_GUILD_ID` makes the command available immediately in that one server and is recommended. Without it, the command is registered globally instead.

To copy the server ID, enable **Discord User Settings > Advanced > Developer Mode**, right-click the RoViral server icon, and choose **Copy Server ID**.

For a local check, put the token in `.env.local` and run:

```bash
npm run bot:local
```

Stop it with `Ctrl+C`. Use `npm run dev` in a second terminal for the website.

## Security

Rotate any Discord webhook or bot token that has ever appeared in a public message, screenshot, repository commit, or deployment log. Update the secret on its host after rotation and redeploy or restart the related service.
