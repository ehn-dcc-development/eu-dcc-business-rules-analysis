/**
 * The common super type of a type hierarchy that's parallel to that of CertLogicExpression,
 * but with the addition of an “unknown” value (leading to the dichotomic notion of constant vs. unknown),
 * a general JSON value (as the result of a data access; also captures CertLogic literals),
 * and more explicit class types.
 *
 * An evaluate function on values of this type is actually an endomorphism.
 */
export interface CLExpr {}


/**
 * Represents a simple value: string, number, boolean, or `null` (as the of a data access of an undefined path).
 */
export class CLJsonValue implements CLExpr {
    readonly value: any
    constructor(value: any) {
        this.value = value
    }
}

export const True = new CLJsonValue(true)
export const False = new CLJsonValue(false)


/**
 * Represents an “unknown” value, meaning that it remains undefined during evaluation.
 * This value (instance of this class) can be used in the data
 * to express that e.g. a {@link CLDataAccess} will produce some non-`null`,
 * but otherwise unknown value.
 *
 * (This allows for the addition of e.g. *predicated* unknowns, expressing
 * things like “{ var: "payload.v.0.dn" } > 2”.)
 */
export class CLUnknown implements CLExpr {}
export const Unknown = new CLUnknown()


/**
 * Represents a data access, i.e., a `"var"` operation.
 */
export class CLDataAccess implements CLExpr {
    readonly path: string
    constructor(path: string) {
        this.path = path
    }
}


/**
 * Represents an array value, i.e. `[ ... ]`.
 */
export class CLArray {
    readonly items: CLExpr[]
    constructor(items: CLExpr[]) {
        this.items = items
    }
}


/**
 * Represents an operation other than `"var"`.
 */
export class CLOperation implements CLExpr {
    readonly operator: string
    readonly operands: CLExpr[]
    constructor(operator: string, operands: CLExpr[]) {
        this.operator = operator
        this.operands = operands
    }
}


/**
 * Wraps the given JSON value as a {@link CLExpr}.
 */
export const asValue = (value: any): CLArray | CLJsonValue => {
    if (value instanceof CLJsonValue) {
        return value
    }
    if (Array.isArray(value)) {
        return new CLArray((value as any[]).map(asValue))
    }
    return new CLJsonValue(value)
}

