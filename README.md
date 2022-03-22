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

The [Digital COVID Certificate (DCC)](https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en) allows determining whether a person is deemed fit-for-travel into a country-of-arrival (CoA) based on their vaccination, test, and recovery status.
To make such determinations, [business (or validation, or verification) rules](https://github.com/ehn-dcc-development/dgc-business-rules) can be implemented in verifier apps.

This repository contains an analysis of the business rules that have been uploaded to the EU DCC Gateway.
The analysis focuses almost entirely on rules pertaining to vaccination DCCs.
The analysis takes the shape of a number of JSON files which aggregate findings on the uploaded business rules, typically organised per country that has uploaded business rules.
These JSON files are also presented in the form of an equal number of static, standalone HTML files: the <em>“dashboard pages”</em>.

These **dashboard pages** are:

* [An inventory of what countries accept which vaccines, including waiting time and validity](https://htmlpreview.github.io/?https://github.com/ehn-dcc-development/dcc-business-rules-analysis/blob/main/analysis/vaccine-specs-per-country.html)
* [A matrix detailing which vaccines are accepted by which countries](https://htmlpreview.github.io/?https://github.com/ehn-dcc-development/dcc-business-rules-analysis/blob/main/analysis/vaccine-country-matrix.html)
* [A dashboard detailing which countries have uploaded how many business rules](https://htmlpreview.github.io/?https://github.com/ehn-dcc-development/dcc-business-rules-analysis/blob/main/analysis/statistics.html)
* [The result of validating all business rules](https://htmlpreview.github.io/?https://github.com/ehn-dcc-development/dcc-business-rules-analysis/blob/main/analysis/validation-results.html)
* [An overview of which rule (versions) are _currently_ available](https://htmlpreview.github.io/?https://github.com/ehn-dcc-development/dcc-business-rules-analysis/blob/main/analysis/version-metadata.html), including their validity range - this is mainly per development purposes

These analysis files are persisted in this repository to be able to easily track changes to the business rules over time.
The URLs in this list use a free, open-source external service to renders static HTML files on GitHub as Web pages.
It works by pre-pending "`https://htmlpreview.github.io/?`" to the original GitHub URL.


### Disclaimer

The analysis of the business rules is performed <em>automatically</em> (using an algorithm that's based on [_partial evaluation_](./src/reducer/README.md)).
This algorithm makes a number of assumptions.
If these are violated then usually the analysis aborts before the end.
In case of a bug, the algorithm might actually finish, in which case the produced analysis is inaccurate.

The algorithm also replaces some sub expressions in the CertLogic part of business rules with equivalent (or at least: sufficiently similar) ones to circumvent limitations that the partial evaluator currently has.
These replacements can be found in [the `replacements.json` file](./src/analyser/replacements.json), and are organised per country.


### Organisation of this repository

* [`analysis/`](./analysis): All generated analyses, in both JSON format (the source), and HTML files generated from that.
* [`doc/`](./doc): Some documentation (in MarkDown format).
* [`per-country/`](./per-country): For every country that uploaded business rules, a directory with all their rules retrieved from the EU DCC Gateway (or rather: one of the National Backends).
  All rules with the same rule identifier (ID, e.g. `VR-NL-0007`) are stored in one separate file, as <em>rule versions</em> (in anti-chronological order) under that rule ID.
  Remarks:
  * A rule JSON file has a name that consists of the rule's ID with the country code (and 1 hyphen) removed.
    E.g., all rule versions 
  * Versions of a rule whose `ValidTo` date lies in the past is not in these files.
    (That's a consequence of the implementation of the API of the EU DCC Gateway.)
* [`src/`]: All source code for JavaScript/Node.js programs.
* [`tmp/`]: A Git-ignored directory for storing temporary files, without committing these.

Beyond that, the repository contains some shell scripts, and the usual license, and JavaScript- and TypeScript-related config files.


## Running the analysis

Triggering the analysis is done by running the [main build script](./build.sh) from the command-line:

    $ ./build.sh

This downloads and installs JavaScript dependencies, retrieves the uploaded business rules from a National Backend, analyses those, and generates the analysis artefacts in the `analysis/` directory.
The analysis that determines which countries accept which vaccines with which validity ranges is somewhat time-consuming: roughly a couple of minutes.
Because of that, the build script is broken up into two phases: [1. retrieval](./retrieve.sh) of value sets, business rules, and generation of non-vaccination-related analysis artefacts, and [2. running the vaccine-centric analyses](./analyse.sh).


### Dependencies

The analysis has the following dependencies:

* UNIX/zsh-like shell for running the [build script](./build.sh)
* [Node.js, NPM](https://nodejs.org/en/) - alternative for NPM: [Yarn](https://yarnpkg.com/)
* [`jq`](https://stedolan.github.io/jq/) (&larr; =link)


## Testing & Status

- If you found any problems, please create an [Issue](/../../issues).
- Current status: Work-In-Progress.


## Re-open Europe API

[Re-open Europe](https://reopen.europa.eu/en) is a website/app made by the EU [Joint Research Center (JRC)](https://ec.europa.eu/info/departments/joint-research-centre_en) to provide information on travel and health measures during the COVID-19 pandemic.
An API for that information is available, and is [documented here](https://data.jrc.ec.europa.eu/dataset/2d9e1e99-b177-4c53-a8a7-4eea96f89273).
This code base contains some code to try and “harvest” that API, in the directory [`src/jrc/`](./src/jrc).
You can run that code from the command-line as follows (from the repository's root):

  $ source src/jrc/retrieve.sh

This produces various files in the directory `tmp/jrc`.


## Licensing

Copyright (c) 2021- Dutch Ministry of Health, Science, and Sports, and all other contributors

Licensed under the **Apache License, Version 2.0** (the "License"); you may not use this file except in compliance with the License.

You may obtain a copy of the License at https://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" 
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [LICENSE](./LICENSE) for the specific 
language governing permissions and limitations under the License.

