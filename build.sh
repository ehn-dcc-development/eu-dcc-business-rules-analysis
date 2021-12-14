npm install
mkdir -p tmp

curl -X GET --header "Accept: application/json" https://verifier-api.coronacheck.nl/v4/dcbs/business_rules | jq --raw-output '.payload' | base64 --decode | jq '.' > tmp/all-rules.json
echo "Downloaded rules."

cat tmp/all-rules.json | jq 'map((.Identifier|capture("(?<t>[A-Z]+)-(?<c>[A-Z]+)-(?<n>[0-9]+)")) + .)' > tmp/all-rules-exploded-IDs.json
rm -rf per-country/*
node src/split-rules.js
echo "Split rules up per country."

rm tmp/*.txt

node src/generate-vaccine-info.js > tmp/vaccine-info-problems.txt
echo "Generated vaccine info per country."

node src/generate-vaccine-inventory.js
echo "Generated vaccine inventory."

node src/check-rules.js > tmp/check-results.txt
echo "Checked (validated) all rules."

