#!/bin/sh

echo "Computing vaccine info per country, per vaccine, per combo..."
node dist/compute-vaccine-info.js > tmp/vaccine-info.log
echo "Computed vaccine info."

node dist/generate-vaccine-inventory.js
echo "Generated vaccine inventory."

node dist/generate-vaccine-centric-inventory.js
echo "Generated vaccine-centric inventory."

