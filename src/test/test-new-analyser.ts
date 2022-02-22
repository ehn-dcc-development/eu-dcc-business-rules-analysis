const {deepEqual} = require("chai").assert

import {
    and_,
    comparison_,
    if_,
    plusTime_,
    var_
} from "certlogic-js/dist/factories"

import {analyse} from "../analyser/new-analyser"


const nowExpr = plusTime_(var_("external.validationClock"), 0, "day")
const dtExpr = (days: number) => plusTime_(var_("payload.v.0.dt"), days, "day")


describe(`analyse plusTime with var`, () => {

    it(`recognises "now"`, () => {
        deepEqual(
            analyse(nowExpr),
            {
                $type: "KnownPlusTime",
                field: "now",
                days: 0
            }
        )
    })

    it(`recognises "dt"`, () => {
        const expr = dtExpr(1)
        deepEqual(
            analyse(expr),
            {
                $type: "KnownPlusTime",
                field: "dt",
                days: 1
            }
        )
    })

})


describe(`analyse comparisons`, () => {

    it(`recognises right of case 1`, () => {
        const expr = comparison_("not-after", nowExpr, dtExpr(270))
        deepEqual(
            analyse(expr),
            {
                $type: "IntervalSide",
                days: 270,
                including: true,
                side: "right"
            }
        )
    })

    it(`recognises left of case 1`, () => {
        const expr = comparison_("not-before", nowExpr, dtExpr(7))
        deepEqual(
            analyse(expr),
            {
                $type: "IntervalSide",
                days: 7,
                including: true,
                side: "left"
            }
        )
    })

    it(`recognises tri-comparison 1/2`, () => {
        const expr = comparison_("not-after", dtExpr(7), nowExpr, dtExpr(270))
        deepEqual(
            analyse(expr),
            {
                $type: "Interval",
                left: {
                    $type: "IntervalSide",
                    days: 7,
                    including: true,
                    side: "left"
                },
                right: {
                    $type: "IntervalSide",
                    days: 270,
                    including: true,
                    side: "right"
                }
            }
        )
    })

    it(`recognises tri-comparison 2/2`, () => {
        const expr = comparison_("before", dtExpr(14), nowExpr, dtExpr(180))
        deepEqual(
            analyse(expr),
            {
                $type: "Interval",
                left: {
                    $type: "IntervalSide",
                    days: 14,
                    including: false,
                    side: "left"
                },
                right: {
                    $type: "IntervalSide",
                    days: 180,
                    including: false,
                    side: "right"
                }
            }
        )
    })

})


describe(`analyse and`, () => {

    it(`recognises a variant of case 1`, () => {
        const expr = and_(comparison_("not-after", nowExpr, dtExpr(270)), comparison_("not-before", nowExpr, dtExpr(7)))
        deepEqual(
            analyse(expr),
            {
                $type: "Interval",
                left: {
                    $type: "IntervalSide",
                    days: 7,
                    including: true,
                    side: "left"
                },
                right: {
                    $type: "IntervalSide",
                    days: 270,
                    including: true,
                    side: "right"
                }
            }
        )
    })

})


describe(`analyse if`, () => {

    it(`recognises reducible if 1/3`, () => {
        const expr = if_(comparison_("not-after", nowExpr, dtExpr(270)), true, false)
        deepEqual(
            analyse(expr),
            {
                $type: "IntervalSide",
                days: 270,
                including: true,
                side: "right"
            }
        )
    })

    it(`recognises reducible if 2/3`, () => {
        const expr = if_(comparison_("before", nowExpr, dtExpr(25)), false, true)
        deepEqual(
            analyse(expr),
            {
                $type: "IntervalSide",
                days: 25,
                including: false,
                side: "left"
            }
        )
    })

    it(`recognises reducible if 3/3`, () => {
        const expr = if_(comparison_("before", nowExpr, dtExpr(420)), true, true)
        deepEqual(
            analyse(expr),
            true
        )
    })

})

