import {asISODate} from "../utils/date-utils"
import {writeHtml} from "../utils/file-utils"
import {lowerTriangular} from "../utils/func-utils"
import {asDisplayList, externalAnchor} from "../utils/html-utils"
import {
    country2CodeTo3Code,
    countryCode2DisplayName,
    flagEmoji
} from "../refData/country-utils"
import {vaccineIdToDisplayName} from "../refData/vaccine-data"
import {
    ComboInfo,
    VaccineSpec,
    VaccineSpecsForCountry,
    vaccineSpecsPerCountryFile
} from "../json-files"


const redCrossMark = "&#x274c;"

const comboValueAsUnannotatedText = (comboValue: ComboInfo) => {
    if (comboValue === null) {
        return redCrossMark
    }
    if (typeof comboValue === "number") {
        return `${comboValue}-`
    }
    return `${comboValue[0]}-${comboValue[1]}`
}

const comboAsHtml = (comboValue: ComboInfo) =>
    `<td>${(comboValueAsUnannotatedText(comboValue))}</td>`


const combosShown = lowerTriangular(6).map(([ i, j ]) => `${i+1}/${j+1}`)
const vaccineInfoAsHtml = (vaccineSpec: VaccineSpec, country: string) =>
    `<tr><!-- country: ${country} -->
    <td class="vaccines">${asDisplayList(vaccineSpec.vaccineIds.map(vaccineIdToDisplayName))}</td>
${combosShown.map((combo) => comboAsHtml(vaccineSpec.combos[combo])).join("\n")}
</tr>
`

const vaccineSpecsForCountryAsHtml = ({ country, vaccineSpecs }: VaccineSpecsForCountry) =>
    `<tr id="${country}">
    <td class="country">
        ${countryCode2DisplayName[country]} (${country} - ${flagEmoji(country)})
    </td>
    <td colspan="${1 + combosShown.length}" class="links">
        ${externalAnchor(`https://reopen.europa.eu/en/map/${country2CodeTo3Code(country)}/7010`, "regs. on Re-open EU", false)}
        &nbsp;
        (${externalAnchor(`https://reopen.europa.eu/en/map/${country2CodeTo3Code(country)}/7001`, "regs. on Re-open EU for from EU MS or Schengen", false)})
    </td>
</tr>
${vaccineSpecs.map((vaccineSpec) => vaccineInfoAsHtml(vaccineSpec, country)).join("\n")}
`


const theadContents = () =>
    `<tr>
    <th>Accepted vaccines</th>
${combosShown.map((combo) => `  <th>${combo}</th>`).join("\n")}
</tr>`


const vaccineSpecsPerCountryAsHtml = (vaccineSpecsPerCountry: VaccineSpecsForCountry[]) =>
    `<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Vaccine acceptance per country</title>
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
        td {
            text-align: right;
        }
        td.country {
            text-align: center;
            background-color: lightgray;
        }
        td.vaccines {
            text-align: left;
            width: 30em;
        }
        span.tt {
            font-family: monospace;
        }
        td.links {
            text-align: left;
        }
    </style>
  </head>
  <body>
    <h1>Dashboard page: vaccine acceptance per country</h1>
    <p>
        Below is a table that details which country accepts which vaccines, and with what validity period.
        For every country, links to the relevant page on the Re-open EU site are provided as well - (not all of these links work).
    </p>
    <p>
        <b>Disclaimer</b>
        This information is derived <em>algorithmically</em> from the business rules uploaded to the EU DCC Gateway.
        The algorithm used makes a couple of assumptions: when these are violated, the algorithm typically aborts its running.
        In rare cases, the algorithm finishes but produces an inaccurate analysis result.
        In any case: <em>no rights whatsoever can be derived from the information presented here.</em>
    </p>
    <p>
        Date of generation: <em>${asISODate(new Date())}</em>
    </p>
    <table>
        <thead>
${theadContents()}
        </thead>
        <tbody>
            ${vaccineSpecsPerCountry.map(vaccineSpecsForCountryAsHtml).join("\n")}
        </tbody>
        <tfoot>
${theadContents()}
        </tfoot>
    </table>
    <p>
        Legend:
    </p>
    <ul>
        <li>
        The vaccines are the ones <em>recognised</em> by the EMA.
        </li>
        <li>
            Validity periods are dependent on the values of the <span class="tt">dn/sd</span> fields: <b>1/1, 2/2, 2/1, 3/3, 3/2, etc.</b>
            Note that values like 3/2, 5/3, etc. are not allowed anymore according to the EU Regulations, but it's not unlikely DCCs have been issued like that.
        </li>
        <li>
            A validity period is expressed in the format "<em>from</em>-<em>until</em>" which means:
            "the vaccine is accepted (with the indicated values for the <span class="tt">dn/sd</span> fields) from the <em>from</em>-th day after the vaccination date (the value of the <span class="tt">dt</span> field), until the <em>until</em>-th day.”</li>
        <li>
            If the <em>until</em>-part is empty, the vaccine is accepted “forever”/indefinitely.
        </li>
        <li>
            A red cross mark (${redCrossMark}) means that the vaccine is not accepted at all for those values of <span class="tt">dn/sd</span>.
        </li>
    </ul>
    <p>
    </p>
  </body>
</html>
`


writeHtml("analysis/vaccine-specs-per-country.html", vaccineSpecsPerCountryAsHtml(vaccineSpecsPerCountryFile.contents))

