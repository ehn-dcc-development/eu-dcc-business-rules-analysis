#!/bin/bash

node dist/check-rules.js
echo "Checked (validated) all rules."

node dist/serialise-version-metadata.js
echo "Serialised rules' versions' metadata."

echo "Computing vaccine info per country, per vaccine, per combo..."
node dist/compute-vaccine-specs-per-country.js
echo "Computed vaccine specs per country."

