#!/bin/bash
set -e
echo "=== Application Starting ==="

# REQUIRED: Wait for database with timeout
max_attempts=30
attempt=1
DB_HOST=${DB_HOST:-localhost}

while ! nc -z $DB_HOST 5432; do
  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database timeout"
    exit 1
  fi
  echo "Attempt $attempt/$max_attempts: waiting..."
  sleep 2
  attempt=$((attempt+1))
done

echo "✅ Database ready!"

# REQUIRED: Run initialization/seeding
node seeder.js
if [ -n "$INIT_SCRIPT" ]; then
  echo "Running custom initialization: $INIT_SCRIPT"
  # Support dot-notation (e.g. scripts.seed_private -> node scripts/seed_private.js)
  if echo "$INIT_SCRIPT" | grep -q "\." && ! echo "$INIT_SCRIPT" | grep -q " "; then
    CMD="node $(echo "$INIT_SCRIPT" | sed 's/\./\//g').js"
    echo "Converting $INIT_SCRIPT to $CMD"
    $CMD
  else
    $INIT_SCRIPT
  fi
else
  node scripts/seed_public.js
fi

# REQUIRED: Start application
exec node server.js
