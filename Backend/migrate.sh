#!/usr/bin/env bash
# Database migration script for production

echo "Running database migrations..."
npx prisma db push

echo "Database migration completed!"