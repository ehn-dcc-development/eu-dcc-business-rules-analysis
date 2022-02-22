import {CertLogicExpression} from "certlogic-js"

import {isCertLogicLiteral} from "./helpers"


/**
 * The common super type of a type hierarchy that extends CertLogicExpression
 * with an “unknown” value (leading to the dichotomic notion of constant vs. unknown),
 * and a type to wrap JSON objects (`{ ... }`).
 * That last type is necessary to be able to distinguish JSON objects representing operations from JSON objects that are the result of a data access (`"var"` operation).
 *
 * An evaluate function on values of this type is actually an endomorphism.
 */
export type CLExtExpr =
    | CertLogicExpression
    | CLUnknown
    | CLObjectValue


/**
 * Represents an “unknown” value, meaning that it remains undefined during evaluation.
 * This value (instance of this class) can be used in the data
 * to express that e.g. a data access will produce some non-`null`,
 * but otherwise unknown value.
 *
 * (This allows for the addition of e.g. *predicated* unknowns, expressing
 * things like “{ var: "payload.v.0.dn" } > 2”.)
 */
export class CLUnknown {}
export const Unknown = new CLUnknown()


export type ObjectType = object | null
export class CLObjectValue {
    readonly value: ObjectType
    constructor(value: ObjectType) {
        this.value = value
    }
}


export const isCertLogicExpression = (expr: CLExtExpr): expr is CertLogicExpression => {
    if (expr instanceof CLUnknown || expr instanceof CLObjectValue) {
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

