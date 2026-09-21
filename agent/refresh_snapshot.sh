#!/usr/bin/env bash
# Regenerate the agent's copy of the site content from the local Next.js app.
# Run after editing lib/config.ts or lib/content.ts, then redeploy the agent.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run dev > /tmp/snapshot-dev.log 2>&1 &
DEV=$!
trap 'kill $DEV 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  if curl -sf -m 2 -H 'Accept: text/markdown' http://localhost:3000/ -o /dev/null; then break; fi
  sleep 1
done

curl -sf -m 20 -H 'Accept: text/markdown' http://localhost:3000/ -o agent/site_snapshot.md
echo "wrote agent/site_snapshot.md ($(wc -c < agent/site_snapshot.md) bytes)"
