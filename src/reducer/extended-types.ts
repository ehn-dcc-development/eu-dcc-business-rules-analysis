import {CertLogicExpression, isInt} from "certlogic-js"
import {isDictionary} from "certlogic-js/dist/internals"

import {isCertLogicLiteral} from "./helpers"


/**
 * The common super type of a type hierarchy that extends CertLogicExpression
 * with an “unknown” value (leading to the dichotomic notion of constant vs. unknown),
 * and a type to wrap JSON values that are not valid CertLogic expressions (`null`, and non-integer `number`s),
 *  or are objects extracted from the input data through a data access/`var` operation,
 *  and that might be otherwise indistinguishable from CertLogic operation objects.
 *
 * An evaluate function on values of this type is actually an endomorphism.
 */
export type CLExtExpr =
    | CertLogicExpression
    | CLWrapped
    | CLUnknown


/**
 * Represents an “unknown” value, meaning that it remains undefined during evaluation.
 * This value (instance of this class) can be used in the data
 * to express that e.g. a data access will produce some non-`null`,
 * but otherwise unknown value.
 *
 * (This allows for the addition of e.g. *predicated* unknowns, expressing
 * things like “{ var: "payload.v.0.dn" } > 2”.)
 *
 * The identifier `Unknown` is used because TypeScript already has a keyword for the `unknown` type.
 */
export class CLUnknown {}
export const Unknown = new CLUnknown()


export type NeedWrapping = object | null | number
export class CLWrapped {
    readonly value: NeedWrapping
    constructor(value: NeedWrapping) {
        this.value = value
    }
}

export const wrapData = (value: any): CLExtExpr => {
    if (typeof value === "boolean" || typeof value === "string" || isInt(value)) {
        return value
    }
    if (Array.isArray(value)) {
        return value.map(wrapData)
    }
    if (value === null || isDictionary(value)) {
        return new CLWrapped(value)
    }
    throw new Error(`can't wrap value: ${value}`)
}


export const isCertLogicExpression = (expr: CLExtExpr): expr is CertLogicExpression => {
    if (expr instanceof CLUnknown || expr instanceof CLWrapped) {
        return false
    }
    if (isCertLogicLiteral(expr)) {
        return true
    }
    if (Array.isArray(expr)) {
        return expr.every(isCertLogicExpression)
    }
    if (typeof expr === "object") {
        const operands = Object.values(expr)[0]
        return typeof operands === "string" || (operands as CLExtExpr[]).every(isCertLogicExpression)
    }
    throw new Error(`isCertLogicExpression can't handle CLExtExpr: ${expr}`)
}

