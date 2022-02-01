const { parseRuleId } = require("dcc-business-rules-utils")

const { writeJson } = require("./file-utils")
const { groupBy } = require("./func-utils")
const { vaccineSpecsFromRules } = require("./vaccine-info")


const allRules = require("../tmp/all-rules.json")

const vaccineRulesPerCountry =
    groupBy(
        allRules
            .filter((rule) => parseRuleId(rule.Identifier).type === "VR"),
                // TODO  don't select on type (as it can be inaccurate) when using partial evaluation
                //          (since true non-V-rules should evaluate rather trivially to true)
        (rule) => parseRuleId(rule.Identifier).country
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

