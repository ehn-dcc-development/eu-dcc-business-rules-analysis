const { readJson, writeHtml } = require("./file-utils")

const redCrossMark = "&#x274c;"

const comboValueAsText = (comboValue) => {
    if (comboValue === null) {
        return redCrossMark
    }
    if (typeof comboValue === "number") {
        return `${comboValue}-`
    }
    return `${comboValue[0]}-${comboValue[1]}`
}

const comboAsHtml = (comboValue) =>
`<td>${comboValueAsText(comboValue)}</td>`


const vaccineId2PopularName = {
    "EU/1/20/1528": "Comirnaty (Pfizer/BioNTech)",
    "EU/1/20/1507": "Spikevax (Moderna)",
    "EU/1/21/1529": "Vaxzevria (AstraZeneca)",
    "EU/1/20/1525": "Janssen"
}

const asDisplayName = (vaccineId) =>
    vaccineId2PopularName[vaccineId] || vaccineId

const vaccineInfoAsHtml = (vaccineInfo) =>
`<tr>
    <td class="vaccines">${vaccineInfo.vaccineIds.map(asDisplayName).join(", ")}</td>
${[ "1/1", "2/2", "2/1", "3/3", "3/2", "4/4" ].map((combo) => comboAsHtml(vaccineInfo.combos[combo])).join("\n")}
</tr>
`


const countryCode2DisplayName = require("./country-code-to-display-name.json")
const countryInfoAsHtml = ({ country, vaccineSpecs }) =>
`<tr>
    <td colspan="6" class="country">${countryCode2DisplayName[country]} (${country})</td>
</tr>
${vaccineSpecs.map(vaccineInfoAsHtml).join("\n")}
`

const theadContents = () =>
`<tr>
    <th>Accepted vaccines</th>
    <th>1/1</th>
    <th>2/2</th>
    <th>2/1</th>
    <th>3/3</th>
    <th>3/2</th>
    <th>n/n, n > 3</th>
</tr>`

const infoAsHtml = (infoPerCountry) =>
`<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Vaccination inventory</title>
    <style>
        body {
            font-family: "Helvetica Neue";
            font-size: 10pt;
        }
        table {
          border-collapse: collapse;
        }
        th, td {
            border: 1px black solid;
            padding: 2pt;
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
            width: 80%;
        }
    </style>
  </head>
  <body>
    <h1>Vaccine inventory</h1>
    <p>
        Below is a table that details which country accepts which vaccines, and with what validity period.
        This information is derived <em>algorithmically</em> from the business rules uploaded to the EU DCC Gateway.
        This algorithm makes a couple of assumptions.
        The most important one is that the logic of the vaccination-related business rules is essentially independent from actual dates, but only on the difference between the verification time and the date value of the <tt>dt</tt> field.
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
        <li>Validity periods are dependent on the values of the <tt>dn/sd</tt> fields: <b>1/1, 2/2, 3/3, <em>3/2</em>, n/n, with n > 3</b>.</li>
        <li>A validity period is expressed in the format "<em>from</em>-<em>until</em>" which means:
            "the vaccine is accepted (with the indicated values for the <tt>dn/sd</tt> fields) from the <em>from</em>-th day after the vaccination date (the value of the <tt>dt</tt> field), until the <em>until</em>-th day.”</li>
        <li>If the <em>until</em>-part is empty, the vaccine is accepted “forever”.</li>
        <li>A red cross mark (${redCrossMark}) means that the vaccine is not accepted at all for those values of <tt>dn/sd</tt>.</li>
    </ul>
    <p>
    </p>
  </body>
</html>
`


const vaccineInfoPerCountry = readJson("per-country/vaccine-info.json")

const html = infoAsHtml(vaccineInfoPerCountry)

writeHtml("per-country/vaccine-inventory.html", html)

