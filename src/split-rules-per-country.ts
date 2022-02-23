import {renderAsCompactText} from "certlogic-js/dist/misc"
import {normalCopyOf, parseRuleId, Rule} from "dcc-business-rules-utils"
import {join} from "path"

import {mkDir, writeJson} from "./utils/file-utils"
import {groupBy, sortArrayBy} from "./utils/func-utils"
import {allRulesFile, rulesStatisticsFile} from "./json-files"


type RuleWithLogicAsText = Rule & { "expr-as-text": string }
const normalised = (rule: Rule): RuleWithLogicAsText => {
    const copy: RuleWithLogicAsText = normalCopyOf(rule) as any
    copy["expr-as-text"] = renderAsCompactText(rule.Logic)
    return copy
}

const rulesPerCountry = groupBy(
    allRulesFile.contents,
    (rule) => parseRuleId(rule.Identifier).country
)

Object.entries(rulesPerCountry)
    .forEach(([ country, rulesOfCountry ]) => {
        const countryPath = join("per-country", country)
        mkDir(countryPath)
        Object.entries(
            groupBy(rulesOfCountry, (rule) => rule.Identifier)
        ).forEach(([ id, ruleVersions ]) => {
            const { type, number } = parseRuleId(id)
            const sortedRuleVersions = sortArrayBy(ruleVersions, (ruleVersion) => new Date(ruleVersion.ValidFrom).getTime()).reverse()
            writeJson(join(countryPath, `${type}-${number}.json`), sortedRuleVersions.map((ruleVersion) => normalised(ruleVersion)))
        })
    })


writeJson(
    rulesStatisticsFile.path,
    Object.entries(rulesPerCountry)
        .map(([ co, rules ]) => {
            const ruleVersionsPerId = groupBy(rules, (rule) => rule.Identifier)
            return ({
                co,
                n: Object.entries(ruleVersionsPerId).length,
                nAcceptance: Object.entries(ruleVersionsPerId).filter(([ _, ruleVersions ]) => ruleVersions[0].Type === "Acceptance").length,
                nInvalidation: Object.entries(ruleVersionsPerId).filter(([ _, ruleVersions ]) => ruleVersions[0].Type === "Invalidation").length
            })
        })
)

