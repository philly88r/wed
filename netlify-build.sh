#!/bin/bash

# Display Node and npm versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Install dependencies with specific flags
echo "Installing dependencies..."
npm install --no-audit --no-fund --prefer-offline --legacy-peer-deps

# Build the project
echo "Building the project..."
npm run build

echo "Build process completed!"
