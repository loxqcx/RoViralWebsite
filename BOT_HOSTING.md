# Keep The Discord Bot Online

No host can guarantee zero downtime forever. The practical target is one persistent VM plus automatic restart after application crashes, network interruptions, and machine reboots.

## Recommended Reliable Option

Use one Google Cloud Compute Engine `e2-micro` VM in `us-west1`, `us-central1`, or `us-east1`. Select an Ubuntu image, a non-preemptible standard VM, and no more than 30 GB of standard persistent disk to remain inside the eligible compute and disk free-tier limits. Google requires a billing account, and free-tier limits can change.

Google currently bills a normal external IPv4 address separately at `$0.005` per hour after trial credits, or roughly `$3.60` for a 30-day month. No free host can guarantee that a continuously connected Discord bot will stay online forever. This VM setup favors reliability and automatic recovery over an inaccurate zero-cost promise.

Do not use Vercel or a sleeping free web service for the bot process. Vercel continues hosting the website and API routes; the VM hosts only `bot/online.js`.

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
