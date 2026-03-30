#!/bin/sh
set -e
echo "Executing seed_private.js (private evaluation seeder)..."
# Run from /app so that absolute paths resolve correctly
node /eval_scripts/seed_private.js

