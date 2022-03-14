#!/bin/sh

npm ci
echo "Installed JS (NPM) dependencies."

# re-create the Yarn lock file:
rm yarn.lock
yarn

# compile TypeScript sources:
rm -rf dist
tsc
echo "Compiled TypeScript sources."

source retrieve.sh

source generate-dashboard.sh

