#!/bin/sh

npm install

rm yarn.lock
yarn

tsc

source retrieve.sh

source analyse.sh

