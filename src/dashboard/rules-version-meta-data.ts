import {asISODate} from "../utils/date-utils"
import {writeHtml} from "../utils/file-utils"
import {Map} from "../utils/func-utils"
import {rulesVersionMetaDataFile, Versioning} from "../json-files"


const formatDateTime = (datetime: string) => {
    const parts = datetime.split("T")
    return `<span>${parts[0]}</span> <span class="obscure">${parts[1]}</span>`
}

const tableRow = (ruleId: string, ruleVersionsMetaData: Versioning) =>
    `<tr>
    <td class="tt">${ruleId}</td>
    <td>${ruleVersionsMetaData.version}</td>
    <td>${formatDateTime(ruleVersionsMetaData.validFrom)}</td>
    <td>${formatDateTime(ruleVersionsMetaData.validTo)}</td>
</tr>`

const tableSectionFor = (country: string, rules: Map<Versioning[]>) =>
    `<tr>
    <td colspan="4" class="country">${country}</td>
</tr>
${Object.entries(rules)
        .flatMap(([ ruleId, ruleVersions ]) =>
            ruleVersions.map((ruleVersion, index) =>
                tableRow(index === 0 ? ruleId : "", ruleVersion)
            )
        ).join("\n")}
`

const html = `<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Rules' version meta data</title>
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
            padding: 3pt;
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
        .tt {
            font-family: monospace;
        }
        span.obscure {
            font-size: 8pt;
            color: lightgrey;
        }
    </style>
  </head>
  <body>
    <h1>Dashboard: rules' version meta data</h1>
    <p>
        The table below lists all rules (of all countries, per country), with per rule <em>ID</em> the (still-relevant) versions, together with their version number and validity range.
    </p>
    <p>
      Date of generation: <em>${asISODate(new Date())}</em>
    </p>
    <table>
      <thead>
        <tr>
          <th>rule ID</th>
          <th>version</th>
          <th>valid from</th>
          <th>valid to</th>
        </tr>
      </thead>
      <tbody>
${Object.entries(rulesVersionMetaDataFile.contents)
    .map(([ country, rules ]) =>
        tableSectionFor(country, rules)
    ).join("\n")}
      </tbody>
    </table>
  </body>
</html>
`


writeHtml("analysis/rules-version-meta-data.html", html)

