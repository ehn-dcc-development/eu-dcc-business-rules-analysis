import {ComboInfo} from "../json-files"


export type Unanalysable = {
    $type: "Unanalysable"
    expr: any
}
export const unanalysable = (expr: any): Unanalysable =>
    ({
        $type: "Unanalysable",
        expr
    })
export const isUnanalysable = (validity: Validity): validity is Unanalysable =>
    typeof validity === "object" && validity.$type === "Unanalysable"


export type Side = "left" | "right"
export type IntervalSide = {
    $type: "IntervalSide"
    days: number
    including: boolean
    side: Side
}
export const intervalSide = (days: number, including: boolean, side: Side): IntervalSide =>
    ({
        $type: "IntervalSide",
        days,
        including,
        side
    })
export const isIntervalSide = (validity: Validity): validity is IntervalSide =>
    typeof validity === "object" && validity.$type === "IntervalSide"
export const swapSide = ({ days, including, side }: IntervalSide): IntervalSide =>
    intervalSide(days, including, side === "left" ? "right" : "left")


export type Interval = {
    $type: "Interval"
    left?: IntervalSide
    right?: IntervalSide
}
export const isInterval = (validity: Validity): validity is Interval =>
    typeof validity === "object" && validity.$type === "Interval"
export const interval_ = (left?: IntervalSide, right?: IntervalSide): Interval =>
    ({
        $type: "Interval",
        left,
        right
    })
export const from0Interval = interval_(intervalSide(0, true, "left"))


export type Intervallistic = IntervalSide | Interval
export const isIntervallistic = (validity: Validity): validity is Intervallistic =>
    isIntervalSide(validity) || isInterval(validity)
export const combineIntervalWith = (interval: Interval, intervallistic: Intervallistic): Interval => {
    if (isIntervalSide(intervallistic)) {
        switch (intervallistic.side) {
            case "left":
                return interval.left === undefined || interval.left.days < intervallistic.days || (interval.left.days === intervallistic.days && interval.left.including)
                    ? interval_(intervallistic, interval.right)
                    : interval
            case "right":
                return interval.right === undefined || interval.right.days > intervallistic.days || (interval.right.days === intervallistic.days && interval.right.including)
                    ? interval_(interval.left, intervallistic)
                    : interval
        }
    }
    if (isInterval(intervallistic)) {
        const sides = [intervallistic.left, intervallistic.right]
            .filter((side) => side !== undefined)
            .map((side) => side as IntervalSide)
        return sides.reduce(combineIntervalWith, interval)
    }
    throw new Error(`unhandled intervallistic value: ${intervallistic}`)
}


export type DateTimeField = "now" | "dt"
export type KnownPlusTime = {
    $type: "KnownPlusTime"
    field: DateTimeField
    days: number
}
export const knownPlusTime = (field: DateTimeField, days: number): KnownPlusTime =>
    ({
        $type: "KnownPlusTime",
        field,
        days
    })
export const isKnownPlusTime = (validity: Validity): validity is KnownPlusTime =>
    typeof validity === "object" && validity.$type === "KnownPlusTime"


export type Validity =
    | boolean
    | IntervalSide
    | Interval
    | KnownPlusTime
    | Unanalysable


export const validityAsText = (validity: Validity): string => {
    if (typeof validity === "boolean") {
        return validity ? "0-" : "x"
    }
    switch (validity.$type) {
        case "Interval": return `${validity.left?.days}-${validity.right === undefined ? "" : validity.right.days}`  // TODO  check: ?. works OK?
        case "IntervalSide": return validity.side === "left" ? `${validity.days}-` : `0-${validity.days}`
        case "KnownPlusTime": return `[${validity.field} + ${validity.days} days]`
        case "Unanalysable": return `[...unanalysable...]`
    }
}

export const validityAsCombo = (validity: Validity): ComboInfo => {
    if (typeof validity === "boolean") {
        return validity ? 0 : null
    }
    switch (validity.$type) {
        case "Interval": return validity.right === undefined ? (validity.left?.days ?? 0) : [validity.left?.days ?? 0, validity.right.days]
        case "IntervalSide": return validity.side === "left" ? validity.days : [0, validity.days]
        default: throw new Error(`can't transform validity <<${validityAsText(validity)}>> into a ComboInfo`)
    }
}

