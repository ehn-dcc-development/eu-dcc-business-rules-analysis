#!/bin/sh

echo "Computing vaccine info per country, per vaccine, per combo..."
node src/compute-vaccine-info.js > tmp/vaccine-info.log
echo "Computed vaccine info."

node src/generate-vaccine-inventory.js
echo "Generated vaccine inventory."

