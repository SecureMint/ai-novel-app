#!/bin/sh
set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
NODE_DIR=/Users/ai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
FALLBACK_BIN=/Users/ai/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback
API_LOG=/private/tmp/novel-reader-api.log

export PATH="$NODE_DIR:$FALLBACK_BIN:$PATH"
cd "$PROJECT_DIR"

if [ ! -x "$NODE_DIR/node" ]; then
  echo "Node.js runtime not found: $NODE_DIR/node"
  exit 1
fi

"$NODE_DIR/node" apps/api/dist/index.js >"$API_LOG" 2>&1 &
API_PID=$!
WEB_PID=

cleanup() {
  if [ -n "${WEB_PID:-}" ]; then kill "$WEB_PID" 2>/dev/null || true; fi
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

attempt=0
until curl -fsS http://127.0.0.1:4000/health >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "API failed to start:"
    cat "$API_LOG"
    exit 1
  fi
  if [ "$attempt" -ge 20 ]; then
    echo "API health check timed out. See $API_LOG"
    exit 1
  fi
  sleep 0.25
done

echo "API ready: http://127.0.0.1:4000/health"
echo "Database: $PROJECT_DIR/apps/api/data/novel.db"
echo "Starting web app: http://localhost:8081"
echo "Press Ctrl+C to stop both services."

cd "$PROJECT_DIR/apps/mobile"
EXPO_NO_TELEMETRY=1 CI=1 ./node_modules/.bin/expo start --web --port 8081 --localhost &
WEB_PID=$!
wait "$WEB_PID"
