#!/usr/bin/env bash
# Netlify build: pull published content from Sanity, export the site, then
# redeploy Sanity Studio (runwithnicole.sanity.studio) if a deploy token is set.
set -euo pipefail

node on-deploy.mjs
npm run build

if [ -z "${SANITY_AUTH_TOKEN:-}" ] || [[ "${SANITY_AUTH_TOKEN}" == your-* ]]; then
  echo "⚠️  SANITY_AUTH_TOKEN not set — skipping Sanity Studio deploy."
  exit 0
fi

cd studio
npx sanity deploy -y
