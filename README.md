<h1 align="center">
 Digital COVID Certificates: Analysis of Business Rules
</h1>

<p align="center">
    <a href="#about">About</a> •
    <a href="#assumptions">Assumptions</a> •
    <a href="#organisation">Organisation</a> •
    <a href="#testing--status">Testing & Status</a> •
    <a href="#licensing">Licensing</a>
</p>


## About

The [Digital COVID Certificate (DCC)](https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en) allows to determine whether a person is deemed fit-for-travel into a country-of-arrival (CoA) based on their vaccination, test, and recovery status.
To make such determinations, [business (or validation, or verification) rules](https://github.com/ehn-dcc-development/dgc-business-rules) can be implemented in verifier apps.

This repository contains a rolling analysis of the business rules that have been uploaded to the EU DCC Gateway.
The analysis revolves mostly around rules pertaining to DCCs with the _vaccination_ event/certificate type.

Triggering the analysis is done by running the [build script](./build.sh) from the command-line:

    $ ./build.sh

This produces several JSON files, and two standalone HTML files in the `analysis/` directory:

* [An inventory of what countries accept which vaccines, including waiting time and validity](./analysis/vaccine-inventory.html)
* [A dashboard detailing which countries have uploaded how many business rules](./analysis/dashboard.html)

These analysis files are persisted in this repository to be able to easily track changes to the business rules over time.
That also makes it easy to look at the analysis without needing to clone this repository, and trigger the analysis.
You can do this from the command-line as follows:

    $ curl "https://raw.githubusercontent.com/ehn-dcc-development/dcc-business-rules-analysis/main/analysis/vaccine-inventory.html?TOKEN=..." > vaccine-inventory.html
    $ curl "https://raw.githubusercontent.com/ehn-dcc-development/dcc-business-rules-analysis/main/analysis/dashboard.html?TOKEN=..." > dashboard.html


### Dependencies

The analysis has the following dependencies:

* UNIX/zsh-like shell for running the [build script](./build.sh)
* [Node.js, NPM](https://nodejs.org/en/)
* [`jq`](https://stedolan.github.io/jq/) (&larr; =link)


## Testing & Status

- If you found any problems, please create an [Issue](/../../issues).
- Current status: Work-In-Progress.


## Licensing

Copyright (c) 2021- Dutch Ministry of Health, Science, and Sports, and all other contributors

Licensed under the **Apache License, Version 2.0** (the "License"); you may not use this file except in compliance with the License.

You may obtain a copy of the License at https://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" 
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [LICENSE](./LICENSE) for the specific 
language governing permissions and limitations under the License.

