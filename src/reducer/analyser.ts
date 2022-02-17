import {
    CertLogicExpression,
    isCertLogicOperation,
    TimeUnit
} from "certlogic-js"
import deepEqual from "deep-equal"


export type RangeEnd = {
    days: number
    including: boolean
    side: "left" | "right"
}


export const isOperation = (expr: CertLogicExpression, operator: string | string[]): boolean =>
        isCertLogicOperation(expr)
    &&  (typeof operator === "string" ? Object.keys(expr)[0] === operator : operator.indexOf(Object.keys(expr)[0]) > -1)


export type KnownPlusTime = {
    varPath: string
    amount: number
    unit: TimeUnit
}

export const extractPlusTimeWithVar = (expr: CertLogicExpression): KnownPlusTime | undefined => {
    if (!isOperation(expr, "plusTime")) {
        return undefined
    }
    const operands = Object.values(expr)[0]
    if (!isOperation(operands[0], "var")) {
        return undefined
    }
    return {
        varPath: Object.values(operands[0])[0] as string,
        amount: operands[1],
        unit: operands[2]
    }
}


export const extractRangeEnd = (expr: CertLogicExpression): RangeEnd | undefined => {
    const [ operator, operands ] = Object.entries(expr)[0]
    if (!(operator.endsWith("after") || operator.endsWith("before"))) {
        return undefined
    }
    const extractedOperands = (operands as CertLogicExpression[]).map(extractPlusTimeWithVar)
    if (!(
            extractedOperands.length === 2
        &&  extractedOperands.every((extractedOperand) => extractedOperand !== undefined)
    )) {
        return undefined
    }
    const nowIndex = extractedOperands.findIndex((knownPlusTime) => knownPlusTime!.varPath === "external.validationClock")
    const dtIndex = extractedOperands.findIndex((knownPlusTime) => knownPlusTime!.varPath === "payload.v.0.dt")
    if (nowIndex === -1 || dtIndex === -1) {
        return undefined
    }
    const days = extractedOperands[dtIndex]!.amount
    const including = operator.startsWith("not-")
    let isRight = nowIndex === 0
    if (operator.endsWith("after")) {
        isRight = !isRight
    }
    if (including) {
        isRight = !isRight
    }
    return {
        days,
        including,
        side: isRight ? "right" : "left"
    }
}


export const unique = <T>(things: T[]): T[] =>
    things.filter((thing, index) =>
        !things.slice(0, index).some((earlierThing) => deepEqual(thing, earlierThing))
    )


export const extractRangeEnds = (expr: CertLogicExpression): RangeEnd[] | undefined => {
    if (expr === true) {
        return []
    }
    const operands = isOperation(expr, "and")
        ? Object.values(expr)[0]
        : (isOperation(expr, ["not-after", "not-before", "before", "after"]) ? [expr] : undefined)
    if (operands === undefined) {
        return undefined
    }
    return unique(
        (operands as CertLogicExpression[])
            .map(extractRangeEnd)
            .filter((rangeEndOrUndef) => rangeEndOrUndef !== undefined)
            .map((rangeEnd) => rangeEnd as RangeEnd)
    )
}
// TODO  sort left to right?


export const rangeEndsAsText = (rangeEnds: RangeEnd[] | undefined): string => {
    if (rangeEnds === undefined) {
        return "x"
    }
    switch (rangeEnds.length) {
        case 0: return "0-"
        case 1: return rangeEnds[0].side === "right" ? `0-${rangeEnds[0].days}` : `${rangeEnds[0].days}-`
        case 2: return rangeEnds[0].side === "right" ? `${rangeEnds[1].days}-${rangeEnds[0].days}` : `${rangeEnds[0].days}-${rangeEnds[1].days}`
        default:
            throw new Error(`unhandled`)
    }
}

