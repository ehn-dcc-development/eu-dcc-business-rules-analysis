import {
    CertLogicExpression,
    CertLogicOperation,
    isCertLogicOperation,
    isInt
} from "certlogic-js"


export const operationDataFrom = (expr: CertLogicOperation): [operator: string, operands: string|any[]] => {
    const entries = Object.entries(expr)
    if (entries.length !== 1) {
        throw new Error(`expression object must have exactly one key, but it has ${entries.length}`)
    }
    return entries[0]
}


export const isOperation = (expr: CertLogicExpression, operator: string | string[]): boolean =>
    isCertLogicOperation(expr)
    &&  (typeof operator === "string" ? Object.keys(expr)[0] === operator : operator.indexOf(Object.keys(expr)[0]) > -1)


export const couldBeOperation = (expr: CertLogicExpression): expr is CertLogicOperation =>
    typeof expr === "object" && !Array.isArray(expr) && Object.keys(expr).length === 1


export const treeFlatMap = <T>(root: CertLogicExpression, mapper: (expr: CertLogicExpression, ancestors: CertLogicExpression[]) => T[]): T[] => {
    const map_ = (expr: CertLogicExpression, ancestors: CertLogicExpression[]): T[] => {
        const map__ = (subExpr: CertLogicExpression) => map_(subExpr, [ expr, ...ancestors ])
        if (typeof expr === "string" || isInt(expr) || typeof expr === "boolean") {
            return mapper(expr, ancestors)
        }
        if (expr === null) {
            throw new Error(`invalid CertLogic expression: ${expr}`)
        }
        if (Array.isArray(expr)) {
            return expr.flatMap(map__)
        }
        if (typeof expr === "object") { // That includes Date objects, but those have no keys, so are returned as-is.
            const [operator, values] = operationDataFrom(expr)
            if (operator === "var") {
                return mapper(expr, ancestors)
            }
            if (!(Array.isArray(values) && values.length > 0)) {
                throw new Error(`operation not of the form { "<operator>": [ <values...> ] }`)
            }
            if (operator === "if") {
                return [ ...(values.slice(0, 3).flatMap(map__)), ...mapper(expr, ancestors) ]
            }
            if ([ "===", "and", ">", "<", ">=", "<=", "in", "+", "after", "before", "not-after", "not-before" ].indexOf(operator) > -1) {
                return [ ...(values.flatMap(map__)), ...mapper(expr, ancestors) ]
            }
            if (operator === "!" || operator === "plusTime" || operator === "extractFromUVCI") {
                return [ ...map__(values[0]), ...mapper(expr, ancestors) ]
            }
            if (operator === "reduce") {
                return [ ...(values.slice(0, 3).flatMap(map__)), ...mapper(expr, ancestors) ]
            }
            throw new Error(`unrecognised operator: "${operator}"`)
        }
        throw new Error(`invalid CertLogic expression: ${expr}`)
    }
    return map_(root, [])
}


// TODO  remove this once this has landed in certlogic-js

