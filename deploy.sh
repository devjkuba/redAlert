#!/bin/bash

set -e

echo "🔁 Přepínám do složky projektu..."
cd /srv/redAlert || { echo "❌ Chyba: složka /srv/redAlert neexistuje"; exit 1; }

echo "🔄 Stahuji poslední změny z GitHubu..."
git fetch origin
git reset --hard origin/master

echo "🧹 Čistím backend..."
rm -rf server/node_modules server/dist

echo "📦 Instalace závislostí a build backendu..."
cd server
yarn install --frozen-lockfile
yarn build
cd ..

echo "🧹 Čistím frontend..."
rm -rf node_modules .next public/.next

echo "📦 Instalace závislostí frontend projektu..."
yarn install --frozen-lockfile
yarn build

echo "🛑 Zastavuji staré PM2 procesy (pokud existují)..."
pm2 delete redalert-backend || true
pm2 delete redalert-frontend || true

echo "🚀 Startuji PM2 procesy podle ecosystem.config.js..."
pm2 start ecosystem.config.js

echo "💾 Ukládám aktuální stav PM2..."
pm2 save

echo "✅ ✅ ✅ Deploy úspěšně dokončen."
