#!/bin/bash

DST_DIR=tmp/jrc

mkdir -p $DST_DIR
rm $DST_DIR/* 2> /dev/null
echo "Prepared output directory ($DST_DIR)."

curl https://reopen.europa.eu/api/covid/v1/eutcdata/data/en/all/all | jq . > $DST_DIR/country-info.json
echo "Retrieved all (en) information from Re-open EU's API."

./node_modules/.bin/tsc
echo "Compiled TypeScript sources."

node dist/jrc/main.js
# (produces logging itself)

