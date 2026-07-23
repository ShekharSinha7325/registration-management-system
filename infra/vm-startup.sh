#!/bin/bash
# ============================================================
# VM Startup Script — runs automatically on first boot (GCP metadata)
# Installs: Node.js 20, Nginx, PM2, Git, Certbot
# ============================================================
set -e

apt-get update -y
apt-get install -y curl git nginx software-properties-common ufw

# Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PM2 process manager (global)
npm install -g pm2

# Certbot for HTTPS (optional, run manually later: certbot --nginx)
apt-get install -y certbot python3-certbot-nginx

# Firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# App directory + deploy user setup
mkdir -p /var/www/registration-app
chown -R $(whoami):$(whoami) /var/www/registration-app

# Enable pm2 startup on boot
pm2 startup systemd -u $(whoami) --hp /home/$(whoami) || true

echo "VM bootstrap complete."
