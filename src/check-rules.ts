import {parseRuleId} from "dcc-business-rules-utils"

import {groupBy} from "./utils/func-utils"
import {allRulesFile, validationResultsFile} from "./json-files"
import {validateRulesOfCountry} from "./rules-checker"


const rulesPerCountry = groupBy(
        allRulesFile.contents,
    (rule) => parseRuleId(rule.Identifier).country
)

validationResultsFile.contents =
    Object.entries(rulesPerCountry)
        .map(([ co, rules ]) =>
            validateRulesOfCountry(rules, co)
        )
        .filter((result) => result.rulesWithValidationProblems.length > 0 || result.ruleSetProblems.length > 0)

