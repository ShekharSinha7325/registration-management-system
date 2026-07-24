#!/bin/bash
set -euo pipefail

main() {
  ENV=${1:?"Usage: ./deploy.sh <dev|qa|prod>"}
  APP_DIR="/var/www/registration-app"

  echo ">>> [1/6] Pulling latest code ($ENV branch)"
  cd "$APP_DIR"
  git fetch origin
  git checkout "$ENV"
  git clean -fd backend/package-lock.json frontend/package-lock.json 2>/dev/null || true
  git pull origin "$ENV"

  echo ">>> [2/6] Installing backend dependencies"
  cd "$APP_DIR/backend"
  npm install --omit=dev

  echo ">>> [3/6] Installing frontend dependencies & building"
  cd "$APP_DIR/frontend"
  npm install
  npm run build

  echo ">>> [4/6] Restarting backend via PM2"
  pm2 startOrReload "$APP_DIR/infra/pm2/ecosystem.${ENV}.config.js"
  pm2 save

  echo ">>> [5/6] Reloading Nginx"
  sudo nginx -t
  sudo systemctl reload nginx

  echo ">>> [6/6] Deployment successful for $ENV"
}

main "$@"
