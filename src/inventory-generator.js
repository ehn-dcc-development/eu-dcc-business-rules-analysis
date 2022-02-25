const { countryCode2DisplayName, flagEmoji } = require("./country-utils")
const { lowerTriangular} = require("./func-utils")
const { vaccineIdToDisplayName } = require("./vaccine-data")


const redCrossMark = "&#x274c;"
const redExclamationMark = "&#x2757;"

const comboValueAsUnannotatedText = (comboValue) => {
    if (comboValue === null) {
        return redCrossMark
    }
    if (typeof comboValue === "number") {
        return `${comboValue}-`
    }
    return `${comboValue[0]}-${comboValue[1]}`
}

const comboValueAsText = (comboValue) => {
    const notTranslationInvariant = comboValue !== null && typeof comboValue === "object" && !Array.isArray(comboValue) && comboValue.$translationInvariant === false
    const value = notTranslationInvariant
        ? comboValue.value
        : comboValue
    return comboValueAsUnannotatedText(value) + (notTranslationInvariant ? redExclamationMark : "")
}

const comboAsHtml = (comboValue) =>
    `<td>${comboValueAsText(comboValue)}</td>`


const combosShown = lowerTriangular(6).map(([ i, j ]) => `${i+1}/${j+1}`)
const vaccineInfoAsHtml = (vaccineInfo, country) =>
    `<tr><!-- country: ${country} -->
    <td class="vaccines">${vaccineInfo.vaccineIds.map(vaccineIdToDisplayName).join(", ")}</td>
${combosShown.map((combo) => comboAsHtml(vaccineInfo.combos[combo])).join("\n")}
</tr>
`

const countryInfoAsHtml = ({ country, vaccineSpecs }) =>
    `<tr>
    <td colspan="${1 + combosShown.length}" class="country">${countryCode2DisplayName[country]} (${country} - ${flagEmoji(country)})</td>
</tr>
${vaccineSpecs.map((vaccineSpec) => vaccineInfoAsHtml(vaccineSpec, country)).join("\n")}
`

const theadContents = () =>
    `<tr>
    <th>Accepted vaccines</th>
${combosShown.map((combo) => `  <th>${combo}</th>`).join("\n")}
</tr>`

const infoAsHtml = (infoPerCountry) =>
    `<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Vaccination inventory</title>
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
    </style>
  </head>
  <body>
    <h1>Vaccine inventory</h1>
    <p>
        Below is a table that details which country accepts which vaccines, and with what validity period.
        This information is derived <em>algorithmically</em> from the business rules uploaded to the EU DCC Gateway.
        This algorithm makes a couple of assumptions.
        The most important one of those is that the logic of the vaccination-related business rules only depends the difference between the verification time and the date value of the <span class="tt">dt</span> field.
        Where a violation of that assumption is suspected, the corresponding entry is marked with a “${redExclamationMark}”.
    </p>
    <p>
        Date of generation: <em>${new Date().toISOString()}</em>
    </p>
    <table>
        <thead>
${theadContents()}
        </thead>
        <tbody>
            ${infoPerCountry.map(countryInfoAsHtml).join("\n")}
        </tbody>
        <tfoot>
${theadContents()}
        </tfoot>
    </table>
    <p>
        Legend:
    </p>
    <ul>
        <li>The vaccines are the ones <em>recognised</em> (but not necessarily ubiquitously accepted) by the EMA.</li>
        <li>Validity periods are dependent on the values of the <span class="tt">dn/sd</span> fields: <b>1/1, 2/2, 2/1, 3/3, 3/2, etc.</b>
            Note that values like 3/2, 5/3, etc. are not allowed anymore according to the EU Regulations, but it's not unlikely DCCs have been issued like that.
        </li>
        <li>A validity period is expressed in the format "<em>from</em>-<em>until</em>" which means:
            "the vaccine is accepted (with the indicated values for the <span class="tt">dn/sd</span> fields) from the <em>from</em>-th day after the vaccination date (the value of the <span class="tt">dt</span> field), until the <em>until</em>-th day.”</li>
        <li>If the <em>until</em>-part is empty, the vaccine is accepted “forever”.</li>
        <li>A red cross mark (${redCrossMark}) means that the vaccine is not accepted at all for those values of <span class="tt">dn/sd</span>.</li>
    </ul>
    <p>
    </p>
  </body>
</html>
`
module.exports.infoAsHtml = infoAsHtml

