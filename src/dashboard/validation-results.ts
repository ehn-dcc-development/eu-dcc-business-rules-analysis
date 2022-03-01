import {asISODate} from "../utils/date-utils"
import {writeHtml} from "../utils/file-utils"
import {sortByStringKey} from "../utils/func-utils"
import {countryCode2DisplayName, flagEmoji} from "../refData/country-utils"
import {
    ExtRuleValidationResult,
    ValidationResultForCountry,
    validationResultsFile
} from "../json-files"


const issueRow = (ruleId: string, version: string, type: string, message: string, className: string): string =>
    `<tr>
    <td>${ruleId}</td>
    <td>${version}</td>
    <td>${type}</td>
    <td class="${className}">${message}</td>
</tr>
`

const validationResultAsHtml = (validationResult: ExtRuleValidationResult): string[] =>
    [
        ...validationResult.logicWarnings.map((message) => issueRow(validationResult.ruleId, validationResult.version, "logic", message, "warning")),
        ...(validationResult.affectedFields === null ? [] : [issueRow(validationResult.ruleId, validationResult.version, "metadata", `affected fields declared were ${validationResult.affectedFields.actual.join(",")} but were computed as ${validationResult.affectedFields.computed.join(", ")}`, "warning")]),
        ...validationResult.metaDataErrors.map((message) => issueRow(validationResult.ruleId, validationResult.version, "metadata", message, "error")),
        ...validationResult.schemaValidationsErrors.map((error) => issueRow(validationResult.ruleId, validationResult.version, "schema", error.message ?? "???", "error")),
        ...validationResult.logicValidationErrors.map((error) => issueRow(validationResult.ruleId, validationResult.version, "schema", error.message, "error"))
    ]



const validationResultForCountry = ({ country, rulesWithValidationProblems, ruleSetProblems }: ValidationResultForCountry) =>
    `<tr>
    <td colspan="4" class="country">${countryCode2DisplayName[country]} (${country} - ${flagEmoji(country)})</td>
</tr>
${sortByStringKey(rulesWithValidationProblems, (rule) => `${rule.ruleId}@${rule.version}`).flatMap(validationResultAsHtml).join("\n")}
${ruleSetProblems.map((message) => issueRow("*", "-", "set", message, "warning")).join("\n")}
`


const theadContents = () =>
    `<tr>
    <th>Rule ID</th>
    <th>Version</th>
    <th>Issue type</th>
    <th>Issue message</th>
</tr>`


const validationResultsAsHtml = (validationResults: ValidationResultForCountry[]) =>
    `<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Validation results</title>
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
        .warning {
            background-color: yellow;
        }
        .error {
            background-color: salmon;
        }
    </style>
  </head>
  <body>
    <h1>Dashboard page: validation results</h1>
    <p>
        Below is a table with the validation results per country.
        Both validation problems for specific rules, as problems for the rules of a country as a set, are mentioned.
    </p>
    <p>
        Date of generation: <em>${asISODate(new Date())}</em>
    </p>
    <table>
        <thead>
${theadContents()}
        </thead>
        <tbody>
            ${validationResults.map(validationResultForCountry).join("\n")}
        </tbody>
        <tfoot>
${theadContents()}
        </tfoot>
    </table>
  </body>
</html>
`


writeHtml("analysis/validation-results.html", validationResultsAsHtml(validationResultsFile.contents))

