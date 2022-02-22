import {
    CertLogicExpression,
    isCertLogicOperation,
    TimeUnit
} from "certlogic-js"
import deepEqual from "deep-equal"

import {SimpleComboInfo} from "../vaccine-info"


export type RangeEnd = {
    days: number
    including: boolean
    side: "left" | "right"
}

const invert = ({ days, including, side }: RangeEnd): RangeEnd =>
    ({
        days,
        including: !including,
        side: side === "left" ? "right" : "left"
    })


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


export const extractRangeEnd = (expr: CertLogicExpression): RangeEnd[] | undefined => {
    const [operator, operands] = Object.entries(expr)[0]
    if (operator === "if") {
        const guard_ = operands[0]
        if (operands[1] === true && operands[2] === false) {
            if (isOperation(guard_, ["after", "before", "not-after", "not-before"])) {
                return extractRangeEnd(guard_)
            }
        }
        return undefined
    }
    if (!(operator.endsWith("after") || operator.endsWith("before"))) {
        return undefined
    }
    const extractedOperands = (operands as CertLogicExpression[]).map(extractPlusTimeWithVar)
    if (!extractedOperands.every((extractedOperand) => extractedOperand !== undefined)) {
        return undefined
    }
    if (extractedOperands.length === 2) {
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
        return [
            {
                days,
                including,
                side: isRight ? "right" : "left"
            }
        ]
    }
    if (extractedOperands.length === 3 && extractedOperands[1]?.varPath === "external.validationClock" && operator === "not-after") {
        return [
            {
                days: extractedOperands[0]?.amount!,
                including: true,
                side: "left"
            },
            {
                days: extractedOperands[2]?.amount!,
                including: true,
                side: "right"
            }
        ]
    }
    return undefined
}


export const unique = <T>(things: T[]): T[] =>
    things.filter((thing, index) =>
        !things.slice(0, index).some((earlierThing) => deepEqual(thing, earlierThing))
    )


export const extractRangeEnds = (expr: CertLogicExpression): RangeEnd[] | undefined => {
    if (expr === true) {
        return []
    }
    if (Array.isArray(expr) || typeof expr !== "object") {
        return undefined
    }
    const [operator, operands] = Object.entries(expr)[0]
    switch (operator) {
        case "after":
        case "before":
        case "not-after":
        case "not-before":
        {
            const rangeEnd = extractRangeEnd(expr)
            return rangeEnd === undefined ? undefined : rangeEnd
        }

        case "and":
        {
            return unique(
                (operands as CertLogicExpression[])
                    .flatMap(extractRangeEnd)
                    .filter((rangeEndOrUndef) => rangeEndOrUndef !== undefined)
                    .map((rangeEnd) => rangeEnd as RangeEnd)
            )
            // TODO  sort left to right?
        }

        case "if":
        {
            const guard_ = operands[0]
            const [innerOperator, _] = Object.entries(guard_)[0]
            if (operands[1] === false && operands[2] === true) {
                if (innerOperator === "after") {
                    const rangeEnd = extractRangeEnd(guard_)
                    return rangeEnd === undefined ? undefined : rangeEnd.map(invert)
                }
            }
            if (innerOperator === "and" && operands[1] === true && operands[2] === false) {
                return extractRangeEnds(guard_)
            }
            if (operands[1] === true && operands[2] === true) {
                return []
            }
            console.warn(`giving up:`)
            console.dir(expr)
            return undefined
        }

        default:
        {
            return undefined
        }
    }
}


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

export const rangeEndsAsSimpleComboInfo = (rangeEnds: RangeEnd[] | undefined): SimpleComboInfo => {
    if (rangeEnds === undefined) {
        return null
    }
    switch (rangeEnds.length) {
        case 0: return 0
        case 1: return rangeEnds[0].side === "right" ? [0, rangeEnds[0].days] : rangeEnds[0].days
        case 2: return rangeEnds[0].side === "right" ? [rangeEnds[1].days, rangeEnds[0].days] : [rangeEnds[0].days, rangeEnds[1].days]
        default:
            throw new Error(`unhandled`)
    }
}

