#!/bin/bash

npm ci
echo "Installed JS (NPM) dependencies."

# compile TypeScript sources:
rm -rf dist
./node_modules/.bin/tsc
echo "Compiled TypeScript sources."

source scripts/retrieve.sh

source scripts/compute.sh

source scripts/generate-dashboard.sh

