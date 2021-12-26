#!/bin/sh

npm install
mkdir -p tmp

valueSets="country-2-codes.json \
  disease-agent-targeted.json\
  test-manf.json\
  test-result.json\
  test-type.json\
  vaccine-mah-manf.json\
  vaccine-medicinal-product.json\
  vaccine-prophylaxis.json\
"

for vs in $valueSets; do
  curl "https://raw.githubusercontent.com/ehn-dcc-development/ehn-dcc-valuesets/main/$vs" > $vs
done

jq --slurp 'map( { (.valueSetId): .valueSetValues|keys }) | add' $valueSets > src/valueSets.json

for vs in $valueSets; do
  rm $vs
done

echo "Compressed value sets."

curl -X GET --header "Accept: application/json" https://verifier-api.coronacheck.nl/v4/dcbs/business_rules | jq --raw-output '.payload' | base64 --decode | jq '.' > tmp/all-rules.json
# ACC: https://verifier-api.acc.coronacheck.nl/v4/dcbs/business_rules
echo "Downloaded rules."

cat tmp/all-rules.json | jq 'map((.Identifier|capture("(?<t>[A-Z]+)-(?<c>[A-Z]+)-(?<n>[0-9]+)")) + .)' > tmp/all-rules-exploded-IDs.json
rm -rf per-country/*
node src/split-rules.js
echo "Split rules up per country."

rm tmp/*.txt

node src/check-rules.js > tmp/check-results.txt
echo "Checked (validated) all rules."

#exit 1

echo "Computing vaccine info per country, per vaccine, per combo..."
node src/compute-vaccine-info.js > tmp/vaccine-info-log.txt
echo "Computed vaccine info."

node src/generate-vaccine-inventory.js
echo "Generated vaccine inventory."

