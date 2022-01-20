const { writeJson } = require("./file-utils")
const { parseId } = require("./rules-utils")
const { vaccineSpecsFromRules } = require("./vaccine-info")


const allRules = require("../tmp/all-rules.json")


const vaccineRulesPerCountry = {}

for (const rule of allRules) {
    const { c, t } = parseId(rule.Identifier)
    if (t === "VR" && new Date(rule.ValidFrom) < new Date()) {
        if (!(c in vaccineRulesPerCountry)) {
            vaccineRulesPerCountry[c] = []
        }
        vaccineRulesPerCountry[c].push(rule.Logic)
    }
}

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

