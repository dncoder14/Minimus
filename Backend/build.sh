#!/usr/bin/env bash
# Build script for Render deployment

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Build completed successfully!"