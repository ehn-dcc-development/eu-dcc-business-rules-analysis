import {
    CLArray,
    CLDataAccess,
    CLExpr,
    CLJsonValue, CLOperation,
    CLUnknown, Unknown
} from "./abstract-types"
import {isFalsy, isInt, isTruthy} from "certlogic-js/dist/internals"


/**
 * Check whether the given `expr` is of constant value.
 * This assumes that the given `expr` is already evaluated abstractly against data.
 */
export const isConstant = (expr: CLExpr): boolean => {
    if (expr instanceof CLUnknown) {
        return false
    }
    if (expr instanceof CLJsonValue) {
        return true
    }
    if (expr instanceof CLArray) {
        return expr.items.every(isConstant)
    }
    if (expr instanceof CLDataAccess) {
        return false
    }
    if (expr instanceof CLOperation) {
        return expr.operands.every(isConstant)
    }
    throw new Error(`isConstant can't handle this CLExpr: ${JSON.stringify(expr)}`)
}


export type Boolsy = boolean | undefined

export const boolsiness = (expr: CLExpr): Boolsy => {
    if (expr instanceof CLJsonValue) {
        if (isTruthy(expr.value)) {
            return true
        }
        if (isFalsy(expr.value)) {
            return false
        }
        return undefined
    }
    if (expr instanceof CLArray) {
        return expr.items.length > 0
    }
    if (expr instanceof CLUnknown) {
        return undefined
    }
    if (expr instanceof CLDataAccess) {
        return undefined    // can't reduce an unreduced data access to a boolean
    }
    if (expr instanceof CLOperation) {
        return expr.operator in ["plusTime"] || undefined
    }
    throw new Error(`boolsiness can't handle this CLExpr: ${JSON.stringify(expr)}`)
}


export const areEqual = (left: CLExpr, right: CLExpr): Boolsy => {
    if (left instanceof CLJsonValue) {
        return left.value === (right instanceof CLJsonValue ? right.value : right)
    }
    if (left instanceof CLArray) {
        return right instanceof CLArray && left.items.length === right.items.length && left.items.every((item, index) => areEqual(item, right.items[index]))
    }
    if (left instanceof CLUnknown) {
        return undefined
    }
    if (left instanceof CLDataAccess) {
        return right instanceof CLDataAccess && left.path === right.path
    }
    if (left instanceof CLOperation) {
        return undefined
    }
    throw new Error(`areEqual can't handle this left CLExpr: ${JSON.stringify(left)}`)
}


/**
 * Determine whether the given value is a valid CertLogic literal expression,
 * meaning: a string, an integer number, or a boolean.
 */
export const isCertLogicLiteral = (expr: any): boolean =>
    typeof expr === "string" || isInt(expr) || typeof expr === "boolean"
// TODO  move into CertLogic internals


type Comparable = string | number
const compareFn = (operator: ">" | "<" | ">=" | "<=", left: Comparable, right: Comparable): boolean => {
    switch (operator) {
        case ">": return left > right
        case "<": return left < right
        case ">=": return left >= right
        case "<=": return left <= right
    }
}

export const compare = (operator: ">" | "<" | ">=" | "<=", left: CLExpr, right: CLExpr): Boolsy => {
    if (left instanceof CLJsonValue) {
        return right instanceof CLJsonValue ? compareFn(operator, left.value, right.value): undefined
    }
    return undefined
}


export const boolsyAsCLExpr = (boolsy: Boolsy): CLExpr =>
    boolsy === undefined ? Unknown : new CLJsonValue(boolsy)

