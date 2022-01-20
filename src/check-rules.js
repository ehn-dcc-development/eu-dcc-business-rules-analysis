const { validateRulesOfCountry } = require("./rules-checking")
const { writeJson } = require("./file-utils")
const { groupBy } = require("./func-utils")
const { parseId } = require("./rules-utils")


const allRules = require("../tmp/all-rules.json")


const rulesPerCountry = groupBy(allRules, (rule) => parseId(rule.Identifier).c)

writeJson(
    "analysis/validation-errors.json",
    Object.entries(rulesPerCountry)
        .flatMap(([ co, rules ]) =>
            validateRulesOfCountry(rules, co)
        )
)

