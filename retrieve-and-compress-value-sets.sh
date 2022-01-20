curl -X GET --header "Accept: application/json" https://verifier-api.coronacheck.nl/v4/dcbs/value_sets | jq --raw-output '.payload' | base64 --decode | jq '.' > tmp/valueSets-uncompressed.json
node src/compress-value-sets.js
echo "Retrieved and compressed value sets."
