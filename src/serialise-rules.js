const { renderAsCompactText } = require("certlogic-js/dist/misc")
const { normalCopyOf, parseRuleId } = require("dcc-business-rules-utils")
const { join } = require("path")

const { mkDir, writeJson } = require("./file-utils")
const { groupBy, sortArrayBy } = require("./func-utils")


const allRules = require("../tmp/all-rules.json")


const rulesPerCountry = groupBy(allRules, (rule) => parseRuleId(rule.Identifier).country)

const normalised = (rule) => {
    const copy = normalCopyOf(rule)
    copy["expr-as-text"] = renderAsCompactText(rule.Logic)
    return copy
}

for (const c in rulesPerCountry) {
    const countryPath = join("per-country", c)
    mkDir(countryPath)
    Object.entries(
        groupBy(rulesPerCountry[c], (rule) => rule.Identifier)
    ).forEach(([ id, ruleVersions ]) => {
        const { type, number } = parseRuleId(id)
        const sortedRuleVersions = sortArrayBy(ruleVersions, (ruleVersion) => new Date(ruleVersion.ValidFrom).getTime()).reverse()
        writeJson(join(countryPath, `${type}-${number}.json`), sortedRuleVersions.map((ruleVersion) => normalised(ruleVersion)))
    })
}

writeJson(
    "analysis/n-rules-per-country.json",
    Object.entries(rulesPerCountry)
        .map(([ co, rules ]) =>
            ({
                co,
                n: rules.length,
                nAcceptance: rules.filter((rule) => rule.Type === "Acceptance").length,
                nInvalidation: rules.filter((rule) => rule.Type === "Invalidation").length
            })
        )
)

