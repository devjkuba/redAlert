#!/bin/bash

echo "📥 Pulling latest changes from GitHub..."
git pull origin master

echo "📦 Installing backend dependencies..."
cd server
yarn install

echo "🔨 Building backend..."
yarn run build

echo "⬅️ Going back to project root..."
cd ..

echo "📦 Installing frontend dependencies..."
yarn install

echo "⚒️ Building frontend..."
yarn run build

echo "🔁 Restarting PM2 processes..."
pm2 restart all

echo "✅ Deploy finished!"