const { vaccineIds, vaccineIdToDisplayName } = require("./vaccine-data")


const vaccineInfoAsHtml = (vaccineId, acceptingCountries, countries) =>
    `<tr>
    <td class="vaccine">${vaccineIdToDisplayName(vaccineId)}</td>
${countries.map((country) => `<td class="${acceptingCountries.indexOf(country) > -1 ? "green" : "red"}"></td>`).join("\n")}
</tr>
`

const theadContents = (countries) =>
    `<tr>
    <th class="vaccine">Vaccine</th>
${countries.map((country) => `  <th class="country">${country}</th>`).join("\n")}
</tr>`

const infoAsHtml = (acceptingCountriesPerVaccine, countries) =>
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
        th.vaccine {
            font-style: italics;
        }
        th.country {
            width: 1em;
        }
        td.vaccine {
            text-align: right;
        }
        td.green {
            background-color: green;
        }
        td.red {
            background-color: red;
        }
    </style>
  </head>
  <body>
    <h1>Vaccine-centric inventory</h1>
    <p>
        Below is a table that details which vaccines are accepted by which country.
        Acceptance might be conditional on waiting periods and maximum validity, but that level of detail is not present here.
        This information is derived <em>algorithmically</em> from the business rules uploaded to the EU DCC Gateway.
        This algorithm makes a couple of assumptions: when these are violated, the analysis is inaccurate.
    </p>
    <p>
        Date of generation: <em>${new Date().toISOString()}</em>
    </p>
    <table>
        <thead>
${theadContents(countries)}
        </thead>
        <tbody>
            ${vaccineIds.map((vaccineId) =>
                vaccineInfoAsHtml(vaccineId, acceptingCountriesPerVaccine.find((info) => info.vaccineId === vaccineId).acceptingCountries, countries)
            ).join("\n")}
        </tbody>
        <tfoot>
${theadContents(countries)}
        </tfoot>
    </table>
    <p>
        Legend:
    </p>
        The vaccines are the ones <em>recognised</em> (but not necessarily ubiquitously accepted) by the EMA.
    <p>
    </p>
  </body>
</html>
`
module.exports.infoAsHtml = infoAsHtml

