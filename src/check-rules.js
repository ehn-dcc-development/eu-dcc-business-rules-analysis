const { validateRulesOfCountry } = require("./rules-checking")
const { writeJson } = require("./file-utils")
const { parseId } = require("./rules-utils")


const allRules = require("../tmp/all-rules.json")


const rulesPerCountry = {}

for (const rule of allRules) {
    const { c } = parseId(rule.Identifier)
    if (!(c in rulesPerCountry)) {
        rulesPerCountry[c] = []
    }
    rulesPerCountry[c].push(rule)
}

writeJson(
    "analysis/validation-errors.json",
    Object.entries(rulesPerCountry)
        .flatMap(([ co, rules ]) =>
            validateRulesOfCountry(rules, co)
        )
)

