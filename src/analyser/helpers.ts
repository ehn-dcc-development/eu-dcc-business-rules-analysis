import {CertLogicExpression, isCertLogicOperation} from "certlogic-js"
import deepEqual from "deep-equal"


export const unique = <T>(things: T[]): T[] =>
    things.filter((thing, index) =>
        !things.slice(0, index).some((earlierThing) => deepEqual(thing, earlierThing))
    )


export const isOperation = (expr: CertLogicExpression, operator: string | string[]): boolean =>
    isCertLogicOperation(expr)
    &&  (typeof operator === "string" ? Object.keys(expr)[0] === operator : operator.indexOf(Object.keys(expr)[0]) > -1)


