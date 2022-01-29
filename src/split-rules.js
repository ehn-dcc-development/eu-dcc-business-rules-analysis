const { normalCopyOf } = require("dcc-business-rules-utils")
const { gt } = require("semver")
const { join } = require("path")

const { mkDir, writeJson } = require("./file-utils")
const { groupBy } = require("./func-utils")
const { renderAsText } = require("./render-expression-as-text")
const { parseId } = require("./rules-utils")


const allRules = require("../tmp/all-rules.json")


const rulesPerCountry = groupBy(allRules, (rule) => parseId(rule.Identifier).c)

const normalised = (rule) => {
    const copy = normalCopyOf(rule)
    copy["expr-as-text"] = renderAsText(rule.Logic)
    return copy
}

const now = new Date()

for (const c in rulesPerCountry) {
    const countryPath = join("per-country", c)
    mkDir(countryPath)
    const ruleMap = {}
    for (const rule of rulesPerCountry[c]) {
        const id = rule.Identifier
        const version = rule.Version
        if (new Date(rule.ValidTo) > now) {
            if (id in ruleMap) {
                const prevRule = ruleMap[id]
                if (gt(version, prevRule.Version)) {
                    ruleMap[id] = rule
                    console.log(`favoured version "${version}" of rule with id="${id}" over version "${prevRule.Version}"`)
                } else {
                    console.log(`favoured version "${prevRule.Version}" of rule with id="${id}" over version "${version}"`)
                }
            } else {
                ruleMap[id] = rule
            }
        } else {
            console.log(`skipped rule with id="${id}" and version="${version}" because it's not valid anymore`)
        }
    }
    Object.values(ruleMap).forEach((rule) => {
        const { t, n } = parseId(rule.Identifier)
        writeJson(join(countryPath, `${t}-${n}.json`), normalised(rule))
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

