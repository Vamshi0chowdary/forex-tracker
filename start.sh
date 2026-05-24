#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Building frontend..."
cd "$ROOT_DIR/frontend"
npm ci
npm run build

echo "Copying frontend/dist -> backend/public"
rm -rf "$ROOT_DIR/backend/public"
mkdir -p "$ROOT_DIR/backend/public"
cp -R dist/* "$ROOT_DIR/backend/public/"

echo "Installing backend deps..."
cd "$ROOT_DIR/backend"
npm ci

echo "Starting backend..."
npm start
