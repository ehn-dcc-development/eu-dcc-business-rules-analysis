const { countryCode2DisplayName, flagEmoji, memberAnnotation } = require("./country-utils")
const { readJson, writeHtml } = require("./file-utils")
const { groupBy } = require("./func-utils")


const rulesInfoPerCountry = readJson("analysis/n-rules-per-country.json")

const countryInfoAsHtml = ({ co, n }) =>
    `<tr>
  <td>${co}</td>
  <td>${countryCode2DisplayName[co]}</td>
  <td>${flagEmoji(co)}</td>
  <td class="number">${n}</td>
  <td>${memberAnnotation(co)}</td>
</tr>
`

const statusCounts = (info) =>
    Object.entries(
        groupBy(info, ({ co }) => memberAnnotation(co))
    ).map(([ anno, cos ]) =>
        ({ anno, n: cos.length })
    )

const html = `<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Vaccination inventory</title>
    <style>
        body {
            font-family: sans-serif, "Helvetica Neue";
            font-size: 12pt;
        }
        table {
          border-collapse: collapse;
        }
        th, td {
            border: 1px black solid;
            padding: 2pt;
        }
        td.number {
            text-align: right;
        }
    </style>
  </head>
  <body>
    <h1>Dashboard Business Rules</h1>
    <p>
      Below is a table that details which countries have uploaded business rules to the EU DCC Gateway,
      and how many.
    </p>
    <p>
      Date of generation: <em>${new Date().toISOString()}</em>
    </p>
    <table>
      <thead>
        <tr>
          <th>code</th>
          <th>name</th>
          <th></th>
          <th>#rules</th>
          <th>status</th>
        </tr>
      </thead>
      <tbody>
${rulesInfoPerCountry.map(countryInfoAsHtml).join("\n")}
      </tbody>
    </table>
    <p>
      Below is a table tallying the countries which have uploaded business rules to the EU DCC Gateway according to status.
    </p>
    <table>
      <thead>
        <tr>
          <th>status</th>
          <th>n</th>
        </tr>
      </thead>
      <tbody>
${statusCounts(rulesInfoPerCountry).map(({ anno, n }) => `<tr>
  <td>${anno}</td>
  <td class="number">${n}</td>
</tr>`).join("\n")}
      </tbody>
    </table>
  </body>
</html>
`

writeHtml("analysis/dashboard.html", html)

