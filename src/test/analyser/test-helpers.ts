const {deepEqual} = require("chai").assert

import {dedup} from "../../analyser/helpers"


describe(`unique`, () => {

    it(`works`, () => {
        deepEqual(dedup([ 1, 2, 3, 2, 2, 1 ]), [ 1, 2, 3 ])
    })
})

