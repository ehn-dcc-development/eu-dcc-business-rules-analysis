#!/bin/bash

node dist/dashboard/statistics.js
echo "Generated dashboard page: business rules statistics."

node dist/dashboard/validation-results.js
echo "Generated dashboard page: validation results."

node dist/dashboard/version-metadata.js
echo "Generated dashboard page: rules' version metadata."

node dist/dashboard/vaccine-specs-per-country.js
echo "Generated dashboard page: vaccine specs per country."

node dist/compute-and-generate-vaccine-country-matrix.js
echo "Generated dashboard page: vaccine-country matrix."

