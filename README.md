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
* [An overview of which rule versions are <em>currently</em> available](./analysis/rules-version-metadata.html), including their validity range

These analysis files are persisted in this repository to be able to easily track changes to the business rules over time.
That also makes it easy to look at the analysis without needing to clone this repository, and trigger the analysis.
You can do this from the command-line as follows:

    $ curl "https://raw.githubusercontent.com/ehn-dcc-development/dcc-business-rules-analysis/main/analysis/rules-statistics.html?TOKEN=..." > rules-statistics.html
    $ curl "https://raw.githubusercontent.com/ehn-dcc-development/dcc-business-rules-analysis/main/analysis/rules-version-metadata.html?TOKEN=..." > dashboard.html
    $ curl "https://raw.githubusercontent.com/ehn-dcc-development/dcc-business-rules-analysis/main/analysis/vaccine-country-matrix.html?TOKEN=..." > vaccine-country-matrix.html
    $ curl "https://raw.githubusercontent.com/ehn-dcc-development/dcc-business-rules-analysis/main/analysis/vaccine-specs-per-country.html?TOKEN=..." > vaccine-specs-per-country.html

This requires access to this, currently private, repository, in combination with a GitHub token.


### Organisation of this repository

* [`analysis/`](./analysis): All generated analyses, in both JSON format (the source), and HTML files generated from that.
* [`doc/`](./doc): Some documentation (in MarkDown format).
* [`per-country/`](./per-country): For every country that uploaded business rules, a directory with all their rules retrieved from the EU DCC Gateway (or rather: one of the National Backends).
  Each rule is stored in a separate file, which contains all the versions of that rule, in anti-chronological order.
  Remarks:
  * A rule JSON file has a name that consists of the rule's ID with the country code (and 1 hyphen) removed.
  * Versions of a rule whose `ValidTo` date lies in the past is not in these files.
    (That's a consequence of the implementation of the API of the EU DCC Gateway.)
* [`src/`]: All source code for JavaScript/Node.js programs.
* [`tmp/`]: A Git-ignored directory for storing temporary files, a.o. logs, without committing these.
* [`build.sh`]: The main build script that retrieves the latest-uploaded rules, value sets, and kicks off the analysis.


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

