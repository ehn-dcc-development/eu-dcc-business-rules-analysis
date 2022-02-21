const { normalCopyOf, hasRulesForAllEventTypes, validateRule } = require("dcc-business-rules-utils")
const { couldBeOperation, operationDataFrom, treeFlatMap } = require("./tree-walker")


const isVaccineIdDataAccess = (expr) => {
    if (couldBeOperation(expr)) {
        const [operator, values] = operationDataFrom(expr)
        if (operator === "var" && values === "payload.v.0.mp") {
            return true
        }
    }
    return false
}

const vaccineIds = require("./valueSets.json")["vaccines-covid-19-names"]

const invalidVaccineIdsInComparison = (expr) => {
    const [operator, values] = operationDataFrom(expr)
    switch (operator) {
        case "in": return Array.isArray(values[1]) ? values[1].filter((vaccineId) => vaccineIds.indexOf(vaccineId) === -1) : []
        case "===": return values.slice(0, 2).filter((operand) => typeof operand === "string" && vaccineIds.indexOf(operand) === -1)
    }
}

const validateRuleIncludingWarnings = (rule) => {
    const emptyArray = []
    treeFlatMap(rule.Logic, (node, ancestors) => {
        if (couldBeOperation(node)) {
            const [operator, values] = operationDataFrom(node)

            if (operator === "plusTime" && typeof values[0] === "string") {
                console.log(`[WARNING] rule with id="${rule.Identifier}" has logic with a "plusTime"-operator with an operand that's a static string ==> might not be invariant under date shifts`)
            }

            if (isVaccineIdDataAccess(node)) {
                const parent = ancestors[0]
                if (couldBeOperation(parent)) {
                    const invalidIds = invalidVaccineIdsInComparison(parent)
                    if (invalidIds.length > 0) {
                        console.log(`[WARNING] rule with id="${rule.Identifier}" has logic that compares the vaccine ID in the DCC against an invalid vaccine ID${invalidIds.length > 1 ? "s" : ""}: ${invalidIds.map((id) => `"${id}"`).join(", ")}`)
                    }
                }
            }

        }
        return emptyArray   // return a singleton [] to satisfy treeFlatMap type-wise
    })
}


const validateRulesOfCountry = (rules, co) => {
    rules.forEach(validateRuleIncludingWarnings)    // --> log
    const validationErrorsPerInvalidRule = rules.map((rule) => validateRule(normalCopyOf(rule))).filter((result) => result.hasErrors)
    console.log(`#invalids(${co})=${(validationErrorsPerInvalidRule.length)}`)    // --> log
    if (!hasRulesForAllEventTypes(rules)) {
        console.log(`[WARNING] rules of country "${co}" don't cover all event types (which is NOT the same as not accepting the event types that weren't covered)`) // --> log
    }
    return validationErrorsPerInvalidRule
}
module.exports.validateRulesOfCountry = validateRulesOfCountry

