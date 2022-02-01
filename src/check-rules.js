const { parseRuleId } = require("dcc-business-rules-utils")

const { validateRulesOfCountry } = require("./rules-checking")
const { writeJson } = require("./file-utils")
const { groupBy } = require("./func-utils")


const allRules = require("../tmp/all-rules.json")


const rulesPerCountry = groupBy(allRules, (rule) => parseRuleId(rule.Identifier).country)

writeJson(
    "analysis/validation-errors.json",
    Object.entries(rulesPerCountry)
        .flatMap(([ co, rules ]) =>
            validateRulesOfCountry(rules, co)
        )
)

