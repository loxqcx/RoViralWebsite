# Discord Setup

## What It Does

The team page keeps the member's public name, role, biography, and fallback username in `src/config/team.js`. It sends only the configured Discord user IDs to `/api/discord-users`. That server route uses the private bot token to retrieve each public Discord username and avatar, then returns only the safe profile fields needed by the page.

Homepage review submissions are sent to a private Discord channel. The bot marks them approved with the first check reaction or denied with the first cross reaction. Only approved embeds are returned by `/api/reviews`.

The bot token never reaches the browser. If Discord or the API is unavailable, the configured initials and fallback username are shown instead.

## Create The Bot

1. Open the Discord Developer Portal and create an application.
2. Open **Bot**, create the bot user, and copy or reset its token.
3. Open **Installation** and install the app into the RoViral Discord server with the `bot` scope. Discord includes the `applications.commands` scope with it.
4. Give the bot View Channel, Send Messages, Add Reactions, and Read Message History permissions in the private review channel.
5. Optional: enable **Server Members Intent** on the Bot page to resolve a submitted username against members of your server. Discord user IDs can be resolved without this optional lookup.
6. Never paste the token into a config file, commit, or chat message.

## Configure Vercel

Add these in **Vercel > Project > Settings > Environment Variables**:

```text
DISCORD_BOT_TOKEN=your_private_bot_token
DISCORD_WEBHOOK_URL=your_private_contact_webhook
DISCORD_MENTION_IDS=1338968623095615508,898661166727962626,860461244627419138
DISCORD_GUILD_ID=your_discord_server_id
DISCORD_REVIEW_CHANNEL_ID=1541656718214307860
```

Apply them to the environments you use and redeploy. Vercel uses `DISCORD_BOT_TOKEN` in server routes only. Keep the review channel private so only staff can see submissions and react to them.

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
DISCORD_REVIEW_CHANNEL_ID=1541656718214307860
# Optional: comma-separated Discord user IDs allowed to approve or deny
DISCORD_REVIEW_MODERATOR_IDS=
```

The worker displays the bot as Online with the activity `Watching RoViral Marketing`. Changing `DISCORD_BOT_ACTIVITY` changes that text. A host that sleeps or stops the worker will make the bot appear Offline.

When the worker starts, it also registers `/test`. Running the command makes the bot reply `lox test successful`. `DISCORD_GUILD_ID` makes the command available immediately in that one server and is recommended. Without it, the command is registered globally instead. Restart or redeploy the worker after adding the review environment variables.

## Moderate Reviews

1. A submission appears in channel `1541656718214307860` with check and cross reactions.
2. React with the check to publish it on the homepage, or the cross to deny it. The first decision is final for that submission.
3. A denied submission receives the bot reply `Review denied`.

When `DISCORD_REVIEW_MODERATOR_IDS` is empty, anyone who can access the private channel can decide. Set it to comma-separated staff Discord user IDs to restrict decisions further. A Discord user ID can retrieve a global public profile even if the reviewer is outside your server. A username can only be matched to a member in your server; otherwise the site uses the submitted username and a fallback avatar.

To copy the server ID, enable **Discord User Settings > Advanced > Developer Mode**, right-click the RoViral server icon, and choose **Copy Server ID**.

For a local check, copy `.env.example` to `.env.local`, then edit `.env.local` only. Never place a real token in `.env.example`.

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Then run:

```bash
npm run bot:local
```

Stop it with `Ctrl+C`. Use `npm run dev` in a second terminal for the website.

## Security

Rotate any Discord webhook or bot token that has ever appeared in a public message, screenshot, repository commit, or deployment log. Update the secret on its host after rotation and redeploy or restart the related service.

This repository includes a pre-commit secret check. Run `git config core.hooksPath .githooks` once after cloning so Git blocks commits containing a Discord bot token or live webhook.
