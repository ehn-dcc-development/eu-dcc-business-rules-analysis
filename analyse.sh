#!/bin/sh

rm tmp/*.log

echo "Computing vaccine info per country, per vaccine, per combo..."
node dist/compute-vaccine-specs-per-country.js > tmp/vaccine-info.log
echo "Computed vaccine specs per country."

node dist/dashboard/vaccine-specs-per-country.js
echo "Generated dashboard page: vaccine specs per country."

node dist/compute-and-generate-vaccine-country-matrix.js
echo "Generated dashboard page: vaccine-country matrix."

