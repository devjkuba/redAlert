#!/bin/bash

echo "🔁 Přepínám do složky projektu..."
cd /srv/redAlert || exit 1

echo "🔄 Přepínám na hlavní branch a stahuji změny z GitHubu..."
git fetch origin
git reset --hard origin/master

echo "🧹 Mažu node_modules, dist a .next (cache)..."
rm -rf node_modules
rm -rf server/dist
rm -rf frontend/.next
rm -rf frontend/node_modules

echo "📦 build backend..."
cd server
yarn install
yarn run build
cd ..

echo "🔨 build frontend..."
yarn install
yarn run build

echo "🚀 Restart PM2 procesů..."
pm2 restart all

echo "✅ Deploy dokončen."