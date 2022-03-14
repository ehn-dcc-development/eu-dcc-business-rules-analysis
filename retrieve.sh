#!/bin/sh

mkdir -p tmp

curl --silent -X GET --header "Accept: application/json" https://verifier-api.coronacheck.nl/v4/dcbs/value_sets | jq --raw-output '.payload' | base64 --decode | jq '.' > tmp/valueSets-uncompressed.json
node dist/refData/compress-value-sets.js
echo "Retrieved and compressed value sets."

curl --silent -X GET --header "Accept: application/json" https://verifier-api.coronacheck.nl/v4/dcbs/business_rules | jq --raw-output '.payload' | base64 --decode > tmp/all-rules.json
echo "Downloaded rules."

rm -rf per-country/*
node dist/split-rules-per-country.js
echo "Split rules up per country."

node dist/check-rules.js
echo "Checked (validated) all rules."

node dist/serialise-version-metadata.js
echo "Serialised rules' versions' metadata."

echo "Computing vaccine info per country, per vaccine, per combo..."
node dist/compute-vaccine-specs-per-country.js
echo "Computed vaccine specs per country."

