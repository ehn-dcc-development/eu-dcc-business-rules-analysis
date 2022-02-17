import {access} from "certlogic-js/dist/internals"

import {
    asValue,
    CLArray,
    CLDataAccess,
    CLExpr,
    CLJsonValue,
    CLOperation,
    CLUnknown, False, True
} from "./abstract-types"
import {
    areEqual,
    boolsiness,
    boolsyAsCLExpr,
    compare,
    isConstant
} from "./helpers"


const evaluateIf = (guard: CLExpr, then: CLExpr, else_: CLExpr, data: unknown): CLExpr => {
    const evalGuard = evaluate(guard, data)
    const evalThen = evaluate(then, data)
    const evalElse = evaluate(else_, data)
    switch (boolsiness(evalGuard)) {
        case true: return evalThen
        case false: return evalElse
        default: return new CLOperation("if", [evalGuard, evalThen, evalElse])
    }
}


const evaluateInfix = (operator: string, operands: CLExpr[], data: unknown): CLExpr => {
    const evalOperands = operands.map((arg) => evaluate(arg, data))
    const reducedCLExpr = new CLOperation(operator, evalOperands)
    // really use the operator to determine whether the evaluation can already be concluded, even if not all operands are constant or transformable back:
    switch (operator) {
        case "===":
        {
            const eq = areEqual(evalOperands[0], evalOperands[1])
            return eq === undefined
                ? new CLOperation("===", [evalOperands[0], evalOperands[1]])
                : new CLJsonValue(eq)
        }
        case "in":
        {
            const [l, r] = evalOperands
            const items = (() => {
                if (r instanceof CLJsonValue) {
                    return r.value
                }
                if (r instanceof CLArray) {
                    return r.items
                }
                return undefined
            })()
            if (!Array.isArray(items)) {
                throw new Error(`right-hand side of an "in" operation must be an array`)
            }
            const equalities = items.map((item) => areEqual(l, item))
            if (equalities.some((eq) => eq === true)) {
                return True
            }
            if (equalities.every((eq) => eq === false)) {
                return False
            }
            return new CLOperation("in", [l, new CLArray(items.filter((_, index) => equalities[index] === undefined))])
        }
        case "and":
        {
            const firstFalsy = evalOperands.find((operand) => boolsiness(operand) === false)
            if (firstFalsy !== undefined) {
                return firstFalsy
            }
            const unknowns = evalOperands.filter((operand) => boolsiness(operand) === undefined)
            switch (unknowns.length) {
                case 0: return True
                case 1: return unknowns[0]
                default: return new CLOperation("and", unknowns)
            }
        }
        case ">":
        case "<":
        case ">=":
        case "<=":
        {
            return boolsyAsCLExpr(compare(operator, evalOperands[0], evalOperands[1]))
        }
        case "+":
        {
            const [l, r] = evalOperands
            if (l instanceof CLJsonValue && r instanceof CLJsonValue) {
                // TODO  more validation
                return new CLJsonValue((l.value as number) + (r.value as number))
            }
            return reducedCLExpr
        }
        default:
        {
            // console.warn(`infix operator "${operator} not handled`)
            return reducedCLExpr
        }
    }
}


const evaluateNot = (operandExpr: CLExpr, data: unknown): CLExpr => {
    const evalOperand = evaluate(operandExpr, data)
    if (isConstant(evalOperand)) {
        const boolsiness_ = boolsiness(evalOperand)
        switch (boolsiness_) {
            case true: return False
            case false: return True
            case undefined: throw new Error(`operand of ! evaluates to something neither truthy, nor falsy: ${evalOperand}`)
        }
    }
    return new CLOperation("!", [evalOperand])
}


const evaluatePlusTime = (dateOperand: CLExpr, amount: CLExpr, unit: CLExpr, data: unknown): CLExpr => {
    const dateTimeStr = evaluate(dateOperand, data)
    return new CLOperation("plusTime", [dateTimeStr, amount, unit])
}


const evaluateReduce = (operand: CLExpr, lambda: CLExpr, initial: CLExpr, data: unknown): CLExpr => {
    const evalOperand = evaluate(operand, data)
    const evalInitial = evaluate(initial, data)
    if (!isConstant(evalOperand) && !isConstant(evalInitial)) {
        return new CLOperation("reduce", [ evalOperand, lambda, evalInitial ])
    }
    if (evalOperand instanceof CLJsonValue && evalOperand.value === null) {
        return evalInitial
    }
    if (!(evalOperand instanceof CLArray)) {
        throw new Error(`operand of reduce evaluated to a non-null non-array`)
    }
    // even if neither are constant, the evaluation result could be constant, so check afterwards:
    const evaluation = evalOperand.items
        .reduce(
            (accumulator, current) =>
                evaluate(lambda, { accumulator, current /* (patch:) , data */ }),
            evalInitial
        )
    if (isConstant(evaluation)) {
        return evaluation
    }
    return new CLOperation("reduce", [ evalOperand, lambda, evalInitial ])
}


const evaluateExtractFromUVCI = (operand: CLExpr, index: CLExpr, data: unknown): CLExpr => {
    const evalOperand = evaluate(operand, data)
    if (evalOperand instanceof CLJsonValue) {
        if (!(evalOperand.value === null || typeof evalOperand.value === "string")) {
            throw new Error(`"UVCI" argument (#1) of "extractFromUVCI" must be either a string or null`)
        }
    }
    return new CLOperation("extractFromUVCI", [evalOperand, index])
}


const evaluate = (expr: CLExpr, data: unknown): CLExpr => {
    if (expr instanceof CLJsonValue) {
        return expr
    }
    if (expr instanceof CLArray) {
        return new CLArray(expr.items.map((item) => evaluate(item, data)))
    }
    if (expr instanceof CLDataAccess) {
        const value = access(data, expr.path)
        if (value instanceof CLUnknown) {
            return expr  // return { "var": <path> }
        }
        return asValue(value)
    }
    if (expr instanceof CLOperation) {
        switch (expr.operator) {
            case "if": return evaluateIf(expr.operands[0], expr.operands[1], expr.operands[2], data)
            case "===":
            case "and":
            case ">":
            case "<":
            case ">=":
            case "<=":
            case "in":
            case "+":
            case "after":
            case "before":
            case "not-after":
            case "not-before":
                return evaluateInfix(expr.operator, expr.operands, data)
            case "!": return evaluateNot(expr.operands[0], data)
            case "plusTime": return evaluatePlusTime(expr.operands[0], expr.operands[1], expr.operands[2], data)
            case "reduce": return evaluateReduce(expr.operands[0], expr.operands[1], expr.operands[2], data)
            case "extractFromUVCI": return evaluateExtractFromUVCI(expr.operands[0], expr.operands[1], data)
        }
    }
    if (expr instanceof CLUnknown) {
        return expr
    }
    throw new Error(`can't handle this CLExpr: ${expr}`)
}

export const evaluateAbstractly = evaluate

