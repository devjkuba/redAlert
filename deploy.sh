#!/bin/bash

set -e

echo "🔁 Přepínám do složky projektu..."
cd /srv/redAlert || { echo "❌ Chyba: složka /srv/redAlert neexistuje"; exit 1; }

echo "🔄 Stahuji poslední změny z GitHubu..."
git fetch origin
git reset --hard origin/master

# --- Příprava backendu do dočasné složky ---
echo "🧹 Čistím dočasný backend build..."
rm -rf /tmp/redalert_backend_build
mkdir -p /tmp/redalert_backend_build
cp -r server /tmp/redalert_backend_build/

echo "📦 Instalace závislostí a build backendu v /tmp..."
cd /tmp/redalert_backend_build/server
yarn install --frozen-lockfile
yarn build

# --- Příprava frontendu do dočasné složky ---
echo "🧹 Čistím dočasný frontend build..."
rm -rf /tmp/redalert_frontend_build
mkdir -p /tmp/redalert_frontend_build
cp -r . /tmp/redalert_frontend_build/

echo "📦 Instalace závislostí a build frontendu v /tmp..."
cd /tmp/redalert_frontend_build
rm -rf node_modules .next public/.next
yarn install --frozen-lockfile
yarn build

# --- Přepnutí na novou verzi ---
echo "🛑 Zastavuji staré PM2 procesy..."
pm2 delete redalert-backend || true
pm2 delete redalert-frontend || true

echo "🔁 Přesunuji nové buildy do produkce..."

# Přesun backendu
rm -rf /srv/redAlert/server
mv /tmp/redalert_backend_build/server /srv/redAlert/

# Přesun frontendu
rm -rf /srv/redAlert/node_modules .next public/.next
mv /tmp/redalert_frontend_build/node_modules /srv/redAlert/
mv /tmp/redalert_frontend_build/.next /srv/redAlert/
mv /tmp/redalert_frontend_build/public/.next /srv/redAlert/public/

# Pokud frontend používá ještě další soubory, případně je zkopírovat

echo "🚀 Startuji PM2 procesy podle ecosystem.config.js..."
cd /srv/redAlert
pm2 start ecosystem.config.js

echo "💾 Ukládám aktuální stav PM2..."
pm2 save

echo "✅ ✅ ✅ Deploy úspěšně dokončen."
