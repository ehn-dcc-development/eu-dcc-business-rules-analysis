import {countryCode2DisplayName, flagEmoji, memberAnnotation} from "../refData/country-utils"
import {asISODate} from "../utils/date-utils"
import {writeHtml} from "../utils/file-utils"
import {groupBy} from "../utils/func-utils"
import {rulesStatisticsFile, RulesStatistics} from "../json-files"


const statistics = rulesStatisticsFile.contents

const perCountryStatisticsAsHtml = ({ co, n, nAcceptance, nInvalidation }: RulesStatistics) =>
    `<tr>
  <td>${co}</td>
  <td>${flagEmoji(co)}</td>
  <td>${countryCode2DisplayName[co]}</td>
  <td>${memberAnnotation(co)}</td>
  <td class="number">${n}</td>
  <td class="number">${nAcceptance}</td>
  <td class="number">${nInvalidation}</td>
</tr>
`

const statusCounts = (info: RulesStatistics[]) =>
    Object.entries(
        groupBy(info, ({ co }) => memberAnnotation(co))
    ).map(([ anno, cos ]) =>
        ({ anno, n: cos.length })
    )

const sum = (nums: number[]): number =>
    nums.reduce((acc, curr) => acc + curr, 0)

const html = `<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Business rules statistics</title>
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
        th, tr.totals {
            background-color: lightgray;
        }
        tr.totals > td:nth-child(1) {
            font-style: italic;
            text-align: center;
        }
    </style>
  </head>
  <body>
    <h1>Dashboard: business rules statistics</h1>
    <p>
      Below is a table that details which countries have uploaded business rules to the EU DCC Gateway,
      and how many.
    </p>
    <p>
      Date of generation: <em>${asISODate(new Date())}</em>
    </p>
    <table>
      <thead>
        <tr>
          <th>code</th>
          <th></th>
          <th>name</th>
          <th>status</th>
          <th>#rules</th>
          <th>#Acc's</th>
          <th>#Inv's</th>
        </tr>
      </thead>
      <tbody>
${statistics.map(perCountryStatisticsAsHtml).join("\n")}
      <tr class="totals">
        <td colspan="4">totals</td>
        <td class="number">${sum(statistics.map(({ n }) => n))}</td>
        <td class="number">${sum(statistics.map(({ nAcceptance }) => nAcceptance))}</td>
        <td class="number">${sum(statistics.map(({ nInvalidation }) => nInvalidation))}</td>
      </tr>
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
${statusCounts(statistics).map(({ anno, n }) => `<tr>
  <td>${anno}</td>
  <td class="number">${n}</td>
</tr>`).join("\n")}
        <tr class="totals">
            <td>totals</td>
            <td>${statistics.length}</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`

writeHtml("analysis/statistics.html", html)

