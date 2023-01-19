#!/bin/sh

mkdir -p tmp
rm -f tmp/*.json

curl --silent -X GET --header "Accept: application/json" https://verifier-api.coronacheck.nl/v4/dcbs/value_sets | jq --raw-output '.payload' | base64 --decode | jq '.' > tmp/valueSets-uncompressed.json
node dist/refData/compress-value-sets.js
echo "Retrieved and compressed value sets."

curl --silent -X GET --header "Accept: application/json" https://verifier-api.coronacheck.nl/v4/dcbs/business_rules | jq --raw-output '.payload' | base64 --decode > tmp/all-rules.json
echo "Downloaded rules."

rm -rf per-country/*
node dist/split-rules-per-country.js
echo "Split rules up per country."

jq 'group_by(.Country) | map({ key: .[0].Country, value: (.|sort_by(.Identifier)|map({ key: .Identifier, value: .})|from_entries) }) | from_entries' tmp/all-rules.json > tmp/dcc-crosscheck.json
echo "Stored all rules in the format compliant with DCC Crosscheck."

