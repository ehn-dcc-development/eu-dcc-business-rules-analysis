const {deepEqual} = require("chai").assert

import {
    combineIntervalWith,
    from0Interval,
    interval_, intervalSide
} from "../../analyser/types"


describe(`intervallistic algebra`, () => {

    it(`[0, -| + (14, 270] === (14, 270]`, () => {
        deepEqual(
            combineIntervalWith(from0Interval, interval_(intervalSide(14, false, "left"), intervalSide(270, true, "right"))),
            interval_(intervalSide(14, false, "left"), intervalSide(270, true, "right"))
        )
    })

    it(`[0, -| + [14, -| === [14, -|`, () => {
        deepEqual(
            combineIntervalWith(from0Interval, intervalSide(14, true, "left")),
            interval_(intervalSide(14, true, "left"))
        )
    })

    it(`[14, -| + [0, 270] === [14, 270]`, () => {
        deepEqual(
            combineIntervalWith(interval_(intervalSide(14, true, "left")), interval_(intervalSide(0, true, "left"), intervalSide(270, true, "right"))),
            interval_(intervalSide(14, true, "left"), intervalSide(270, true, "right"))
        )
    })

    it(`[0, -| + (14, -| === (14, -|`, () => {
        deepEqual(
            combineIntervalWith(from0Interval, intervalSide(14, false, "left")),
            interval_(intervalSide(14, false, "left"))
        )
    })

    it(`[14, -| + [0, 270] === (14, -|`, () => {
        deepEqual(
            combineIntervalWith(interval_(intervalSide(14, false, "left")), interval_(intervalSide(0, true, "left"), intervalSide(270, true, "right"))),
            interval_(intervalSide(14, false, "left"), intervalSide(270, true, "right"))
        )
    })

})

