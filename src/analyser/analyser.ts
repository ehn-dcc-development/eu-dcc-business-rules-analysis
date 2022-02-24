import {CertLogicExpression, isInt} from "certlogic-js"

import {
    interval,
    intervalSide,
    isIntervalSide,
    isKnownPlusTime,
    knownPlusTime,
    swapSide,
    unanalysable,
    Validity
} from "./types"
import {isOperation, operationDataFrom} from "../utils/certlogic-utils"
import {pretty} from "../utils/file-utils"
import {dedup} from "./helpers"


const analyseAnd = (analysedOperands: Validity[]): Validity => {
    const notTrues = analysedOperands.filter((operand) => operand !== true) // skip true values
    if (notTrues.every(isIntervalSide)) {
        const intervalSides = dedup(notTrues)
            .filter((operand) => operand.days > 0)  // (try to) filter out sides that don't add information
        switch (intervalSides.length) {
            case 0: return false
            case 1: return intervalSides[0]
            case 2: return interval(intervalSides)
                // TODO  use a monoidal approach for building the eventual Interval instance
        }
    }
    return unanalysable({ "and": analysedOperands })
}


const analyseComparison = (operator: string, analysedOperands: Validity[]): Validity => {
    const unanalysedExpr = unanalysable({ [operator]: analysedOperands })
    if (!analysedOperands.every(isKnownPlusTime)) {
        return unanalysedExpr
    }
    if (analysedOperands.length === 2) {
        const nowIndex = analysedOperands.findIndex((knownPlusTime) => knownPlusTime.field === "now")
        const dtIndex = analysedOperands.findIndex((knownPlusTime) => knownPlusTime.field === "dt")
        if (nowIndex === -1 || dtIndex === -1) {
            return unanalysedExpr
        }
        const days = analysedOperands[dtIndex].days
        const including = operator.startsWith("not-")
        let isRight = nowIndex === 0
        if (operator.endsWith("after")) {
            isRight = !isRight
        }
        if (including) {
            isRight = !isRight
        }
        return intervalSide(days, including, isRight ? "right" : "left")
    }
    if (analysedOperands.length === 3) {
        const splits = [ analyseComparison(operator, analysedOperands.slice(0, 2)), analyseComparison(operator, analysedOperands.slice(1, 3)) ]
        if (splits.every(isIntervalSide)) {
            return analyseAnd(splits)
        }
    }
    return unanalysedExpr
}


const analyseIf = (guard_: CertLogicExpression, then_: CertLogicExpression, else_: CertLogicExpression): Validity => {
    const unanalysedExpr = unanalysable({ "if": [guard_, then_, else_] })
    if (then_ === true && else_ === true) {
        return true
    }
    if (then_ === true && else_ === false && isOperation(guard_, ["after", "before", "not-after", "not-before", "and"])) {  // boolean-valued operations
        return analyse(guard_)
    }
    if (then_ === false && else_ === true && isOperation(guard_, ["after", "before", "not-after", "not-before"])) {
        const analysedGuard = analyse(guard_)
        return isIntervalSide(analysedGuard) ? swapSide(analysedGuard) : unanalysable({ "!": [analysedGuard] })
    }
    return unanalysedExpr
}


const analysePlusTime = (dateTimeStrExpr: CertLogicExpression, amount: CertLogicExpression, unit: CertLogicExpression): Validity => {
    if (unit === "day" && isOperation(dateTimeStrExpr, "var")) {
        const varPath = Object.values(dateTimeStrExpr)[0] as string
        if (varPath === "external.validationClock" && amount === 0) {
            return knownPlusTime("now", 0)
        }
        if (varPath === "payload.v.0.dt") {
            return knownPlusTime("dt", amount as number)
        }
    }
    return unanalysable({ "plusTime": [dateTimeStrExpr, amount, unit] })
}


export const analyse = (expr: CertLogicExpression): Validity => {

    if (typeof expr === "boolean") {
        return expr
    }

    if (isInt(expr) || typeof expr === "string" || Array.isArray(expr)) {
        return unanalysable(expr)
    }

    if (typeof expr === "object") {
        const [operator, operands] = operationDataFrom(expr)
        const analysedOperands = () => (operands as CertLogicExpression[]).map(analyse)
        switch (operator) {

            case "and":
            {
                return analyseAnd(analysedOperands())
            }

            case "after":
            case "before":
            case "not-after":
            case "not-before":
            {
                return analyseComparison(operator, analysedOperands())
            }

            case "if":
            {
                return analyseIf(operands[0], operands[1], operands[2])
            }

            case "plusTime":
            {
                return analysePlusTime(operands[0], operands[1], operands[2])
            }

            default:
            {
                return unanalysable(expr)
            }

        }
    }

    throw new Error(`can't analyse: ${pretty(expr)}`)
}

