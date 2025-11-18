#!/usr/bin/env bash
# Database migration script for production

echo "Running database migrations..."
npx prisma db push --accept-data-loss

echo "Database migration completed!"