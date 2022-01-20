const allRules = require("../tmp/all-rules-exploded-IDs.json")
const { validateRulesOfCountry } = require("./rules-checking")
const { writeJson } = require("./file-utils")


const rulesPerCountry = {}

for (const rule of allRules) {
    if (!(rule.c in rulesPerCountry)) {
        rulesPerCountry[rule.c] = []
    }
    rulesPerCountry[rule.c].push(rule)
}

writeJson(
    "analysis/validation-errors.json",
    Object.entries(rulesPerCountry)
        .flatMap(([ co, rules ]) =>
            validateRulesOfCountry(rules, co)
        )
)

