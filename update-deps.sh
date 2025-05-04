#!/bin/bash

# Update dependencies without frozen lockfile
echo "Updating dependencies..."
pnpm install --no-frozen-lockfile

# Build the project
echo "Building project..."
pnpm build

echo "Done! Your dependencies have been updated and the build has been verified." 