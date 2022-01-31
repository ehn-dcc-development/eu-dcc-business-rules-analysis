import {CertLogicExpression, CertLogicOperation} from "certlogic-js"
import {
    CLArray,
    CLDataAccess,
    CLExpr,
    CLJsonValue, CLOperation, CLUnknown
} from "./abstract-types"
import {isCertLogicLiteral} from "./helpers"


/**
 * Transform a {@link CertLogicExpression} to an equivalent {@link CLExpr}.
 * @throws An {@link Error} in case of an unhandled sub type of {@link CertLogicExpression}.
 */
export const asCLValue = (expr: CertLogicExpression): CLExpr => {
    if (isCertLogicLiteral(expr)) {
        return new CLJsonValue(expr)
    }
    if (Array.isArray(expr)) {
        return new CLArray((expr as CertLogicExpression[]).map(asCLValue))
    }
    if (typeof expr === "object") {
        const [ operator, values ] = Object.entries(expr)[0]
        return (operator === "var")
            ? new CLDataAccess(values as string)
            : new CLOperation(operator, values.map(asCLValue))
    }
    throw new Error(`can't map this CertLogicExpression to a CLValue: ${expr}`)
}


/**
 * Determine whether the {@link asCertLogicExpression} function would succeed on the given {@link CLExpr} value.
 */
export const isTransformableToCertLogicExpression = (expr: CLExpr): boolean => {
    if (expr instanceof CLUnknown) {
        return false
    }
    if (expr instanceof CLJsonValue) {
        return isCertLogicLiteral(expr.value)
    }
    if (expr instanceof CLArray) {
        return expr.items.every(isTransformableToCertLogicExpression)
    }
    if (expr instanceof CLDataAccess) {
        return true
    }
    if (expr instanceof CLOperation) {
        return expr.operands.every(isTransformableToCertLogicExpression)
    }
    throw new Error(`can't determine whether this CLExpr is expressible as a CertLogicExpression: ${expr}`)
}


/**
 * Transform a {@link CLExpr} back to a {@link CertLogicExpression}.
 * @throws An {@link Error} if that's not possible because of the presence of
 *  a `null`, a {@link CLUnknown}, or an unhandled sub type of {@link CLExpr}.
 */
export const asCertLogicExpression = (expr: CLExpr): CertLogicExpression => {
    if (expr instanceof CLUnknown) {
        throw new Error(`can't map CLDynamic to CertLogicExpression`)
    }
    if (expr instanceof CLJsonValue) {
        if (!isCertLogicLiteral(expr.value)) {
            throw new Error(`CLExpr evaluates to a value that's not a CertLogic literal: ${expr}`)
        }
        return expr.value as CertLogicExpression
    }
    if (expr instanceof CLArray) {
        return expr.items.map(asCertLogicExpression)
    }
    if (expr instanceof CLDataAccess) {
        return {
            "var": expr.path
        }
    }
    if (expr instanceof CLOperation) {
        return {
            [expr.operator]: expr.operands.map(asCertLogicExpression)
        } as CertLogicOperation
    }
    throw new Error(`can't map this CLExpr to a CertLogicExpression: ${expr}`)
}

