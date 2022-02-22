import {pretty} from "../file-utils"


export type Unanalysable = {
    $type: "Unanalysable"
    expr: any
}
export const unanalysable = (expr: any): Unanalysable =>
    ({
        $type: "Unanalysable",
        expr
    })


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
    left: IntervalSide
    right: IntervalSide
}
export const interval = (sides: IntervalSide[]): Interval =>
    ({
        $type: "Interval",
        left: sides[0].side === "left" ? sides[0] : sides[1],
        right: sides[1].side === "right" ? sides[1] : sides[0]
    })


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
        case "Interval": return `${validity.left.days}-${validity.right.days}`
        case "IntervalSide": return validity.side === "left" ? `${validity.days}-` : `-${validity.days}`
        case "KnownPlusTime": return `[${validity.field} + ${validity.days} days]`
        case "Unanalysable": return `unanalysable: ${pretty(validity)}`
    }
}

// TODO  validityAsCombo

