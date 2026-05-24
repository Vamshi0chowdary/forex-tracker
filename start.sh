#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# If npm is available (build environment), build the frontend and install backend deps.
# If npm is not available (runtime minimal container), skip build and start the server with node.
if command -v npm >/dev/null 2>&1; then
	echo "npm found — building frontend and installing backend deps"
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

	echo "Starting backend via npm start"
	npm start
else
	echo "npm not found — assuming runtime container. Starting backend with node."
	if command -v node >/dev/null 2>&1; then
		node "$ROOT_DIR/backend/server.js"
	else
		echo "ERROR: neither npm nor node found in runtime. Cannot start server." >&2
		exit 1
	fi
fi
