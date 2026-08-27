# Keep The Discord Bot Online

Code cannot keep running after the computer hosting it is turned off. A remote host must run the bot process. Free hosts can change their plans or have maintenance, so no provider can guarantee literal zero downtime forever.

## Free Self-Service Hosting

Bot-Hosting.net currently offers one free, continuously running bot deployment with no card, automatic crash restarts, and Discord or GitHub sign-in. It does not require a support ticket. The free deployment must be renewed manually every four days.

Sign in at `https://bot-hosting.net/login`, create a free Node.js deployment, and connect the repository below.

Publish the latest repository first. In the hosting panel, import or clone:

```text
https://github.com/loxqcx/RoViralWebsite.git
```

Use these process settings:

```text
Install command: npm ci --omit=dev
Startup command: npm start
Node.js version: 20 or newer
```

Add these values in the panel's private environment-variable section, not in an uploaded file:

```text
DISCORD_BOT_TOKEN=<real private token>
DISCORD_BOT_ACTIVITY=RoViral Marketing
DISCORD_GUILD_ID=1540448310458974208
DISCORD_REVIEW_CHANNEL_ID=1541656718214307860
DISCORD_BOT_ADMIN_IDS=1312135134165729394,860461244627419138,1338968623095615508,898661166727962626
```

Start the server and check the console for the registered-command message followed by `is online`. Do not run a second copy on a computer or another host.

## Private VM Alternative

The repository also includes a Linux `systemd` installer for a private VM. Use this when you need infrastructure you control instead of a shared free host.

## First Deployment

Create the VM, open its SSH terminal, and run:

```bash
sudo apt update
sudo apt install -y git nodejs npm
git clone https://github.com/loxqcx/RoViralWebsite.git
cd RoViralWebsite
sudo bash deploy/install-bot-service.sh
```

The first run creates `/etc/roviral-bot.env` and stops. Open that private file:

```bash
sudo nano /etc/roviral-bot.env
```

Replace the placeholders with the real bot token and Discord IDs, save with `Ctrl+O`, press Enter, and exit with `Ctrl+X`. Then finish installation:

```bash
sudo bash deploy/install-bot-service.sh
```

The token remains in `/etc/roviral-bot.env`, outside the repository, with root-only file permissions.

## Status And Logs

```bash
sudo systemctl status roviral-bot
sudo journalctl -u roviral-bot -f
```

The service uses `Restart=always`, starts automatically when the VM boots, and waits five seconds before restarting after a failure. Run only this one service instance so Discord events do not produce duplicate responses.

## Publish Bot Updates

```bash
cd ~/RoViralWebsite
git pull
npm ci --omit=dev
sudo systemctl restart roviral-bot
sudo systemctl status roviral-bot
```

## Useful Commands

```bash
sudo systemctl restart roviral-bot
sudo systemctl stop roviral-bot
sudo systemctl start roviral-bot
```
