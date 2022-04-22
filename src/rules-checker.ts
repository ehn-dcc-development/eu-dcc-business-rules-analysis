import {CertLogicExpression, CertLogicOperation} from "certlogic-js"
import {
    hasRulesForAllEventTypes,
    validateRule,
    Rule,
} from "dcc-business-rules-utils"

import {couldBeOperation, operationDataFrom, treeFlatMap} from "./utils/certlogic-utils"
import {vaccineIds} from "./refData/vaccine-data"
import {
    ExtRuleValidationResult,
    ValidationResultForCountry
} from "./json-files"


const isVaccineIdDataAccess = (expr: CertLogicExpression): boolean => {
    if (couldBeOperation(expr)) {
        const [operator, values] = operationDataFrom(expr)
        if (operator === "var" && values === "payload.v.0.mp") {
            return true
        }
    }
    return false
}


const invalidVaccineIdsInComparison = (expr: CertLogicOperation): string[] => {
    const [operator, values] = operationDataFrom(expr)
    switch (operator) {
        case "in": return Array.isArray(values[1])
            ? values[1].filter((vaccineId) => vaccineIds.indexOf(vaccineId) === -1)
            : []
        case "===": return (values as CertLogicExpression[])
            .slice(0, 2)
            .filter((operand) =>
                typeof operand === "string" && vaccineIds.indexOf(operand) === -1
            )
            .map((operand) => operand as string)
        default: {
            return []
        }
    }
}


const logicWarningsFor = (rule: Rule): string[] =>
    treeFlatMap(rule.Logic, (node, ancestors) => {
        const warnings = []
        if (couldBeOperation(node)) {
            const [operator, values] = operationDataFrom(node)

            if (operator === "plusTime" && typeof values[0] === "string") {
                warnings.push(`rule's logic contains a "plusTime"-operation with an operand that's a static string ==> might not be invariant under date shifts`)
            }

            if (isVaccineIdDataAccess(node)) {
                const parent = ancestors[0]
                if (couldBeOperation(parent)) {
                    const invalidIds = invalidVaccineIdsInComparison(parent)
                    if (invalidIds.length > 0) {
                        warnings.push(`rule's logic compares the vaccine ID in the DCC against an invalid vaccine ID${invalidIds.length > 1 ? "s" : ""}: ${invalidIds.map((id) => `"${id}"`).join(", ")}`)
                    }
                }
            }
        }
        return warnings
    })


const validateRuleExt = (rule: Rule): ExtRuleValidationResult => {
    const ruleValidationResult = validateRule(rule)
    return {
        ...ruleValidationResult,
        logicWarnings: logicWarningsFor(rule),
        version: rule.Version
    }
}

export const validateRulesOfCountry = (rules: Rule[], co: string): ValidationResultForCountry => {
    const rulesWithIssues = rules.map(
        (rule) => validateRuleExt(rule)).filter((result) => result.hasErrors || result.logicWarnings.length > 0
    )
    const ruleSetProblems = []
    if (!hasRulesForAllEventTypes(rules)) {
        ruleSetProblems.push(`country's rules don't cover all event types (which is NOT the same as not accepting the event types that weren't covered)`)
    }
    return {
        country: co,
        rulesWithValidationProblems: rulesWithIssues,
        ruleSetProblems
    }
}

