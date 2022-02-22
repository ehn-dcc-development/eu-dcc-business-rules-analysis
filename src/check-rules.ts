import {parseRuleId, Rule} from "dcc-business-rules-utils"

import {validateRulesOfCountry} from "./rules-checking"
import {writeJson} from "./utils/file-utils"
import {groupBy} from "./utils/func-utils"


const allRules: Rule[] = require("../tmp/all-rules.json")


const rulesPerCountry = groupBy(allRules, (rule) => parseRuleId(rule.Identifier).country)

writeJson(
    "analysis/validation-errors.json",
    Object.entries(rulesPerCountry)
        .flatMap(([ co, rules ]) =>
            validateRulesOfCountry(rules, co)
        )
)

