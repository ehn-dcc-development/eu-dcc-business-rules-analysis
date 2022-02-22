const {deepEqual} = require("chai").assert

import {unique} from "../analyser/helpers"


describe(`unique`, () => {

    it(`works`, () => {
        deepEqual(unique([ 1, 2, 3, 2, 2, 1 ]), [ 1, 2, 3 ])
    })
})

