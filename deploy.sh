#!/bin/bash

set -e

echo "🔁 Přepínám do složky projektu..."
cd /srv/redAlert || { echo "Chyba: složka /srv/redAlert neexistuje"; exit 1; }

echo "🔄 Stahuji poslední změny z GitHubu..."
git fetch origin
git reset --hard origin/master

echo "🧹 Mažu backend node_modules a build..."
rm -rf server/node_modules server/dist

echo "📦 Instalace závislostí a build backendu..."
cd server
yarn install --frozen-lockfile
yarn run build
cd ..

echo "🧹 Mažu frontend node_modules a .next..."
rm -rf node_modules .next

echo "📦 Instalace závislostí a build frontendu..."
yarn install --frozen-lockfile
yarn run build

echo "🚀 Restart PM2 procesů podle ecosystem.config.js..."
pm2 reload /srv/redAlert/ecosystem.config.js

echo "✅ Deploy dokončen."
