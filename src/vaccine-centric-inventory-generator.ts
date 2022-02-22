import {vaccineIds, vaccineIdToDisplayName} from "./refData/vaccine-data"
import {VaccineAcceptance} from "./generate-vaccine-centric-inventory"


const vaccineInfoAsHtml = (vaccineId: string, acceptingCountries: string[], countries: string[]) =>
    `<tr>
    <td class="vaccine">${vaccineIdToDisplayName(vaccineId)}</td>
${countries.map((country) => `<td class="${(acceptingCountries.indexOf(country) > -1 ? "" : "not-") + "accepted"}"></td>`).join("\n")}
</tr>
`

const theadContents = (countries: string[]) =>
    `<tr>
    <th class="vaccine">Vaccine</th>
${countries.map((country) => `  <th class="country">${country}</th>`).join("\n")}
</tr>`

export const infoAsHtml = (acceptingCountriesPerVaccine: VaccineAcceptance[], countries: string[]) =>
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
        .accepted {
            background-color: #5be05b;
        }
        .not-accepted {
            background-color: #4994f5;
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
                vaccineInfoAsHtml(vaccineId, acceptingCountriesPerVaccine.find((info) => info.vaccineId === vaccineId)!.acceptingCountries, countries)
            ).join("\n")}
        </tbody>
        <tfoot>
${theadContents(countries)}
        </tfoot>
    </table>
    <p>
        Legend:
    </p>
    <ul>
        <li>The vaccines are the ones <em>recognised</em> (but not necessarily ubiquitously accepted) by the EMA.</li>
        <li>Colours: <span class="accepted">green</span> means <em>accepted</em>, <span class="not-accepted">blue</span> means <em>not accepted</em>.</li>
    </ul>
  </body>
</html>
`

