import {isFalsy, isInt, isTruthy} from "certlogic-js/dist/internals"
import {CLExtExpr, CLObjectValue, CLUnknown, Unknown} from "./abstract-types"


/**
 * Determine whether the given value is a valid CertLogic literal expression,
 * meaning: a string, an integer number, or a boolean.
 */
export type CertLogicLiteral = string | number | boolean
export const isCertLogicLiteral = (expr: any): expr is CertLogicLiteral =>
    typeof expr === "string" || isInt(expr) || typeof expr === "boolean"
// TODO  move both into CertLogic internals


export type Boolsy = boolean | undefined
export const boolsiness = (value: unknown): Boolsy => {
    if (isTruthy(value)) {
        return true
    }
    if (isFalsy(value)) {
        return false
    }
    return undefined
}
// TODO  move both into CertLogic internals


/**
 * Check whether the given `expr` is of constant value.
 * This assumes that the given `expr` is already evaluated abstractly against data.
 */
export const isConstant = (expr: CLExtExpr): boolean => {
    if (expr instanceof CLUnknown) {
        return false
    }
    if (expr instanceof CLObjectValue) {
        return true     // might be a CLUnknown instance in there, but doesn't matter for being constant (TODO  ?)
    }
    if (isCertLogicLiteral(expr)) {
        return true
    }
    if (Array.isArray(expr)) {
        return expr.every(isConstant)
    }
    if (typeof expr === "object") {
        const [operator, operands] = Object.entries(expr)[0]
        return operator !== "var" && (operands as CLExtExpr[]).every(isConstant)
    }
    throw new Error(`isConstant can't handle this CLExtExpr: ${JSON.stringify(expr)}`)
}


export const extBoolsiness = (expr: CLExtExpr): Boolsy => {
    if (expr instanceof CLUnknown) {
        return undefined
    }
    if (expr instanceof CLObjectValue) {
        return boolsiness(expr.value)
    }
    if (isCertLogicLiteral(expr)) {
        return boolsiness(expr)
    }
    if (typeof expr === "object") {
        const [operator, operands] = Object.entries(expr)[0]
        return operator in ["plusTime"] || undefined
    }
}


export const areEqual = (left: CLExtExpr, right: CLExtExpr): Boolsy => {
    if (left instanceof CLUnknown) {
        return undefined
    }
    if (left instanceof CLObjectValue) {
        return left.value === (right instanceof CLObjectValue ? right.value : right)
    }
    if (isComparable(left)) {
        return isComparable(right) && left === right
    }
    if (Array.isArray(left)) {
        return Array.isArray(right)
            && left.length === right.length
            && left.every((item, index) => areEqual(item, right[index]))
    }
    throw new Error(`areEqual can't handle this left CLExpr: ${JSON.stringify(left)}`)
}


type Comparable = string | number
const isComparable = (value: unknown): value is Comparable =>
    typeof value === "string" || typeof value === "number"

const compareFn = (operator: ">" | "<" | ">=" | "<=", left: Comparable, right: Comparable): boolean => {
    switch (operator) {
        case ">": return left > right
        case "<": return left < right
        case ">=": return left >= right
        case "<=": return left <= right
    }
}

export const compare = (operator: ">" | "<" | ">=" | "<=", left: CLExtExpr, right: CLExtExpr): Boolsy =>
    (isComparable(left) && isComparable(right))
        ? compareFn(operator, left, right)
        : undefined


export const boolsyAsCLExpr = (boolsy: Boolsy): CLExtExpr =>
    boolsy === undefined ? Unknown : boolsy
