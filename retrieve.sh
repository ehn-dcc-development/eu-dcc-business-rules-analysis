#!/bin/sh

mkdir -p tmp

curl -X GET --header "Accept: application/json" https://verifier-api.coronacheck.nl/v4/dcbs/value_sets | jq --raw-output '.payload' | base64 --decode | jq '.' > tmp/valueSets-uncompressed.json
node dist/refData/compress-value-sets.js
echo "Retrieved and compressed value sets."

curl -X GET --header "Accept: application/json" https://verifier-api.coronacheck.nl/v4/dcbs/business_rules | jq --raw-output '.payload' | base64 --decode > tmp/all-rules.json
# ACC: https://verifier-api.acc.coronacheck.nl/v4/dcbs/business_rules
# entrypoint for rules on German National Backend: https://distribution.dcc-rules.de/rules
echo "Downloaded rules."

rm -rf per-country/*
node dist/split-rules-per-country.js
echo "Split rules up per country."

node dist/dashboard/rules-statistics.js
echo "Generated dashboard page: business rules statistics."

rm tmp/*.log

node dist/check-rules.js > tmp/check-rules.log
echo "Checked (validated) all rules."

node dist/serialise-version-meta-data.js
echo "Serialised rules' versions' meta data."
node dist/dashboard/rules-version-meta-data.js
echo "Generated dashboard page: rules' version meta data."

