import {parseRuleId} from "dcc-business-rules-utils"

import {writeJson} from "./utils/file-utils"
import {groupBy} from "./utils/func-utils"
import {allRulesFile} from "./json-files"
import {validateRulesOfCountry} from "./rules-checker"


const rulesPerCountry = groupBy(
        allRulesFile.contents,
    (rule) => parseRuleId(rule.Identifier).country
)

writeJson(
    "analysis/rules-validation-errors.json",
    Object.entries(rulesPerCountry)
        .flatMap(([ co, rules ]) =>
            validateRulesOfCountry(rules, co)
        )
)

