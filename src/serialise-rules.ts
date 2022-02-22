import {renderAsCompactText} from "certlogic-js/dist/misc"
import {normalCopyOf, parseRuleId, Rule} from "dcc-business-rules-utils"
import {join} from "path"

import {mkDir, writeJson} from "./utils/file-utils"
import {groupBy, sortArrayBy} from "./utils/func-utils"


const allRules: Rule[] = require("../tmp/all-rules.json")


const rulesPerCountry = groupBy(allRules, (rule) => parseRuleId(rule.Identifier).country)

const normalised = (rule: Rule): Rule & { "expr-as-text": string } => {
    const copy: Rule & { "expr-as-text": string } = normalCopyOf(rule) as any
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

export type NumberOfRulesPerCountry = {
    co: string
    n: number
    nAcceptance: number
    nInvalidation: number
}

writeJson(
    "analysis/n-rules-per-country.json",
    Object.entries(rulesPerCountry)
        .map(([ co, rules ]) => {
            const ruleVersionsPerId = groupBy(rules, (rule) => rule.Identifier)
            return ({
                co,
                n: Object.entries(ruleVersionsPerId).length,
                nAcceptance: Object.entries(ruleVersionsPerId).filter(([ _, ruleVersions ]) => ruleVersions[0].Type === "Acceptance").length,
                nInvalidation: Object.entries(ruleVersionsPerId).filter(([ _, ruleVersions ]) => ruleVersions[0].Type === "Invalidation").length
            })
        }) as NumberOfRulesPerCountry[]
)

