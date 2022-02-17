const {equal, deepEqual} = require("chai").assert

import {
    and_,
    comparison_,
    plusTime_,
    var_
} from "certlogic-js/dist/factories"

import {
    extractPlusTimeWithVar,
    extractRangeEnd,
    extractRangeEnds, rangeEndsAsText, unique
} from "../analyser"


const nowExpr = plusTime_(var_("external.validationClock"), 0, "day")
const dtExpr = (days: number) => plusTime_(var_("payload.v.0.dt"), days, "day")

describe(`extractPlusTimeWithVar`, () => {

    it(`recognises "now"`, () => {
        const expr = nowExpr
        deepEqual(
            extractPlusTimeWithVar(expr),
            {
                varPath: "external.validationClock",
                amount: 0,
                unit: "day"
            }
        )
    })

    it(`recognises "dt"`, () => {
        const expr = dtExpr(0)
        deepEqual(
            extractPlusTimeWithVar(expr),
            {
                varPath: "payload.v.0.dt",
                amount: 0,
                unit: "day"
            }
        )
    })

})

describe(`unique`, () => {

    it(`works`, () => {
        deepEqual(unique([ 1, 2, 3, 2, 2, 1 ]), [ 1, 2, 3 ])
    })
})


describe(`extractRangeEnd`, () => {

    it(`recognises right of case 1`, () => {
        const expr = comparison_("not-after", nowExpr, dtExpr(270))
        deepEqual(
            extractRangeEnd(expr),
            {
                days: 270,
                including: true,
                side: "right"
            }
        )
    })

    it(`recognises right of case 1`, () => {
        const expr = comparison_("not-before", nowExpr, dtExpr(7))
        deepEqual(
            extractRangeEnd(expr),
            {
                days: 7,
                including: true,
                side: "left"
            }
        )
    })

})


describe(`extractRangeEnds`, () => {

    it(`recognises case 1`, () => {
        const expr = and_(comparison_("not-after", nowExpr, dtExpr(270)), comparison_("not-before", nowExpr, dtExpr(7)))
        const rangeEnds = extractRangeEnds(expr)
        deepEqual(
            rangeEnds,
            [
                {
                    days: 270,
                    including: true,
                    side: "right"
                },
                {
                    days: 7,
                    including: true,
                    side: "left"
                }
            ]
        )
        equal(
            rangeEndsAsText(rangeEnds!),
            "7-270"
        )
    })

})

