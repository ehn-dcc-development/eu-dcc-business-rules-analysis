import {and_, if_, var_} from "certlogic-js/dist/factories"

const {equal, isTrue} = require("chai").assert

import {
    CLDataAccess,
    CLExpr,
    CLJsonValue,
    CLOperation,
    Unknown
} from "../abstract-types"
import {evaluateAbstractly} from "../abstract-interpreter"
import {asCLValue} from "../transformers"


const isJsonValue = (expr: CLExpr, expectedValue: any) => {
    isTrue(expr instanceof CLJsonValue)
    equal((expr as CLJsonValue).value, expectedValue)
}

const isDataAccess = (expr: CLExpr, expectedPath: string) => {
    isTrue(expr instanceof CLDataAccess)
    equal((expr as CLDataAccess).path, expectedPath)
}


describe(`data access ("var")`, () => {

    it(`reduces away data accesses`, () => {
        const clExpr = asCLValue(var_("x.0.z"))
        const reducedCLExpr = evaluateAbstractly(clExpr, {})
        isJsonValue(reducedCLExpr, null)
    })

})


describe(`"if" operation`, () => {

    it(`evaluates to the "then" on a guard that evaluates to a truthy value`, () => {
        const clExpr = asCLValue(if_(var_("x.0.z"), true, false))
        const reducedCLExpr = evaluateAbstractly(clExpr, { "x": [ { "z": ["foo"] }]  })
        isJsonValue(reducedCLExpr, true)
    })

    it(`evaluates to the "else" on a guard that evaluates to a falsy value`, () => {
        const clExpr = asCLValue(if_(var_("x.0.z"), true, false))
        const reducedCLExpr = evaluateAbstractly(clExpr, {})
        isJsonValue(reducedCLExpr, false)
    })

    it(`reduces only partially on a guard whose truthiness/falsiness can't be established`, () => {
        const clExpr = asCLValue(if_(var_("x"), true, false))
        const reducedCLExpr = evaluateAbstractly(clExpr, { "x": Unknown })
        isTrue(reducedCLExpr instanceof CLOperation)
        const op = reducedCLExpr as CLOperation
        equal(op.operator, "if")
        const [ guard_, then_, else_ ] = op.operands
        isDataAccess(guard_, "x")
        isJsonValue(then_, true)
        isJsonValue(else_, false)
    })

})


describe(`"and" operation`, () => {

    it(`evaluates to true when no operands are given`, () => {
        const clExpr = asCLValue(and_())
        const reducedCLExpr = evaluateAbstractly(clExpr, {})
        isJsonValue(reducedCLExpr, true)
    })

    it(`evaluates to the operand when only 1 operand is given`, () => {
        const clExpr = asCLValue(and_(var_("x")))
        const reducedCLExpr = evaluateAbstractly(clExpr, { "x": Unknown })
        isDataAccess(reducedCLExpr, "x")
    })

    it(`evaluates to the 2nd operand when the 1st operand is truthy`, () => {
        const clExpr = asCLValue(and_(true, var_("x")))
        const reducedCLExpr = evaluateAbstractly(clExpr, { "x": Unknown })
        isDataAccess(reducedCLExpr, "x")
    })

    // TODO  more cases

})

