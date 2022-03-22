/*
 * HTML-rendering of filtered country info.
 */


import {FilteredCountryInfo, IndicatorExtract} from "./types"
import {uploadingCountriesFile} from "../json-files"
import {
    country2CodeTo3Code,
    country3CodeTo2Code
} from "../refData/country-utils"


const indicatorExtractAsHtml = ({ contents }: IndicatorExtract) =>
    `<tr>
    <td>${contents}</td>
</tr>
`


const countryInfoAsHtml = (countryInfo: FilteredCountryInfo) => {
    const indicatorsOfInterest = countryInfo.indicators.filter(({metadata}) => metadata.id === 7010)
    return `<tr>
    <td colspan="2" class="country">${country3CodeTo2Code(countryInfo.nutscode)}</td>
</tr>
${indicatorsOfInterest.map(indicatorExtractAsHtml).join("\n")}
${indicatorsOfInterest.length === 0 ? `<tr><td colspan="2"><small>(no data available)</small></td></tr>` : ""}
`
}

const theadContents = () =>
    `<tr>
    <th>Contents</th>
</tr>`


const uploadedCountries = uploadingCountriesFile.contents
const uploadedCountriesAs3Codes = uploadedCountries.map(country2CodeTo3Code)

export const filteredCountryInfosAsHtml = (countryInfos: FilteredCountryInfo[]) =>
    `<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Re-open EU: DCC-related</title>
    <style>
        body {
            font-family: sans-serif, "Helvetica Neue";
            font-size: 10pt;
        }
        table {
          border-collapse: collapse;
        }
        th, td {
            border: 1px black solid;
            padding: 2pt;
        }
        th {
          position: sticky;
          top: 0;
          background: lightyellow;
        }
        td.country {
            text-align: center;
            background-color: lightgray;
        }
    </style>
  </head>
  <body>
    <h1>Re-open EU: DCC-related</h1>
    <p>
    </p>
    <table>
        <thead>
${theadContents()}
        </thead>
        <tbody>
            ${countryInfos.filter(({ nutscode }) => uploadedCountriesAs3Codes.indexOf(nutscode) !== -1).map(countryInfoAsHtml).join("\n")}
        </tbody>
        <tfoot>
${theadContents()}
        </tfoot>
    </table>
  </body>
</html>
`

