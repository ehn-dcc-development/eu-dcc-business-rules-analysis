import {asISODate} from "../utils/date-utils"
import {externalAnchor} from "../utils/html-utils"
import {
    isEMAAuthorised,
    vaccineIds,
    vaccineIdToDisplayName
} from "../refData/vaccine-data"
import {VaccineAcceptance} from "../json-files"


const vaccineInfoAsHtml = (vaccineId: string, acceptingCountries: string[], countries: string[]) =>
    `<tr>
    <td class="vaccine${isEMAAuthorised(vaccineId) ? " authorised" : ""}">${vaccineIdToDisplayName(vaccineId)}</td>
${countries.map((country) => `<td class="${(acceptingCountries.indexOf(country) > -1 ? "" : "not-") + "accepted"}"></td>`).join("\n")}
</tr>
`


const theadContents = (countries: string[]) =>
    `<tr>
    <th class="vaccine">Vaccine</th>
${countries.map((country) => `  <th class="country">${country}</th>`).join("\n")}
</tr>`


export const acceptingCountriesPerVaccineAsHtml = (acceptingCountriesPerVaccine: VaccineAcceptance[], countries: string[]) =>
    `<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Vaccine-country matrix</title>
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
            font-style: italic;
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
        .authorised {
            background-color: #ac145a;
            opacity: 80%
        }
        span.tt {
            font-family: monospace;
        }
    </style>
  </head>
  <body>
    <h1>Dashboard: Vaccine-country matrix</h1>
    <p>
        Below is a table that details which vaccines are accepted by which country.
        Acceptance might be conditional on waiting periods and maximum validity, but that level of detail is not present here.
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
${theadContents(countries)}
        </thead>
        <tbody>
            ${vaccineIds.map((vaccineId) =>
                vaccineInfoAsHtml(
                    vaccineId,
                    acceptingCountriesPerVaccine.find((info) =>
                            info.vaccineId === vaccineId
                        )!.acceptingCountries,
                    countries
                )
            ).join("\n")}
        </tbody>
        <tfoot>
${theadContents(countries)}
        </tfoot>
    </table>
    <p>
        Legend/explanation:
    </p>
    <ul>
        <li>
            Background colours of cells have the following meaning:
            <dl>
                <dt><span class="accepted">green</span></dt> <dd>means that the vaccine corresponding to the row is <em>accepted</em> by the country corresponding to the column, while</dd>
                <dt><span class="not-accepted">blue</span></dt> <dd>means <em>not accepted</em>.</dd>
                <dt><span class="authorised">purple</span></dt> <dd>means that the corresponding vaccine is authorised by the EMA.</dd>
            </dl>
        </li>
        <li>
            “Acceptance” could mean that the vaccine has a waiting/delay time or a maximum validity, depending on the values of the <span class="tt">dn/sd</span> fields.
        </li>
        <li>
            The vaccines are the ones <em>recognised</em> by the EMA, and included in the ${externalAnchor("https://github.com/ehn-dcc-development/ehn-dcc-valuesets/blob/main/vaccine-medicinal-product.json", "corresponding eHN value set")}.
        </li>
        <li>
            Not every vaccine is <em>authorised</em> by the EMA: see ${externalAnchor("https://www.ema.europa.eu/en/human-regulatory/overview/public-health-threats/coronavirus-disease-covid-19/treatments-vaccines/vaccines-covid-19/covid-19-vaccines-authorised#authorised-covid-19-vaccines-section", "this table")}.
        </li>
    </ul>
  </body>
</html>
`

