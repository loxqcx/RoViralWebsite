#!/usr/bin/env bash
# Made by loxqcx on Discord.
set -euo pipefail

if [[ ! -f package.json || ! -f bot/online.js ]]; then
  echo "Run this script from the RoViral repository root."
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Install Node.js and npm before running this installer."
  exit 1
fi

APP_DIR="$(pwd -P)"
RUN_USER="${SUDO_USER:-$USER}"
NODE_PATH="$(command -v node)"
ENV_FILE="/etc/roviral-bot.env"
SERVICE_FILE="/etc/systemd/system/roviral-bot.service"

sudo -u "$RUN_USER" npm ci --omit=dev

if [[ ! -f "$ENV_FILE" ]]; then
  sudo install -m 600 -o root -g root deploy/roviral-bot.env.example "$ENV_FILE"
  echo "Created $ENV_FILE. Replace its placeholders, then run this installer again."
  exit 0
fi

if sudo grep -Eq '=your_|=<|=replace_' "$ENV_FILE"; then
  echo "$ENV_FILE still contains placeholder values. Edit it before starting the bot."
  exit 1
fi

sed \
  -e "s|__RUN_USER__|$RUN_USER|g" \
  -e "s|__APP_DIR__|$APP_DIR|g" \
  -e "s|__NODE_PATH__|$NODE_PATH|g" \
  deploy/roviral-bot.service.template | sudo tee "$SERVICE_FILE" >/dev/null

sudo systemctl daemon-reload
sudo systemctl enable --now roviral-bot
sudo systemctl restart roviral-bot
sudo systemctl --no-pager --full status roviral-bot
