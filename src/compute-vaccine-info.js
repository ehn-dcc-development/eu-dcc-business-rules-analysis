const { writeJson } = require("./file-utils")
const { vaccineSpecsFromRules } = require("./vaccine-info-computation")

const allRules = require("../tmp/all-rules-exploded-IDs.json")

const vaccineRulesPerCountry = {}

for (const rule of allRules) {
    if (rule.t === "VR" && new Date(rule.ValidFrom) < new Date()) {
        if (!(rule.c in vaccineRulesPerCountry)) {
            vaccineRulesPerCountry[rule.c] = []
        }
        vaccineRulesPerCountry[rule.c].push(rule.Logic)
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

writeJson("per-country/vaccine-info.json", infoPerCountry)

