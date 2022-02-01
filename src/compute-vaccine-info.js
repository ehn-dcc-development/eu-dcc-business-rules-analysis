const { parseRuleId } = require("dcc-business-rules-utils")

const { writeJson } = require("./file-utils")
const { groupBy, mapValues } = require("./func-utils")
const { vaccineSpecsFromRules } = require("./vaccine-info")


const allRules = require("../tmp/all-rules.json")

const vaccineRulesPerCountry = mapValues(
    groupBy(
        allRules
            .filter((rule) => parseRuleId(rule.Identifier).type === "VR"),
        (rule) => parseRuleId(rule.Identifier).country
    ),
    (rules) => rules.map((rule) => rule.Logic)
    // FIXME  keep ValidFrom to be able to check whether a rule is applicable at the time of the “now” passed, but then also not throw away versions in split-rules.json
)

const nowInMs = () => new Date().getTime()
const startTime = nowInMs()

const infoPerCountry = Object.entries(vaccineRulesPerCountry)
    .map(([ country, rules ]) => ({
        country,
        vaccineSpecs: vaccineSpecsFromRules(rules, country)
    }))

const elapsedInMs = nowInMs() - startTime
console.log(`Computing vaccine info took ${Math.floor(elapsedInMs/1000)}s.${elapsedInMs%1000}ms.`)

writeJson("analysis/vaccine-info.json", infoPerCountry)

