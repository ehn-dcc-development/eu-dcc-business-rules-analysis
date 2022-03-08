import {CertLogicExpression, CertLogicOperation} from "certlogic-js"
import deepEqual from "deep-equal"

import {CLUnknown, Unknown} from "../reducer/extended-types"
import {isCertLogicLiteral} from "../reducer/helpers"
import {operationDataFrom} from "../utils/certlogic-utils"


export const dedup = <T>(things: T[]): T[] =>
    things.filter((thing, index) =>
        !things.slice(0, index).some((earlierThing) => deepEqual(thing, earlierThing))
    )


const valueSets = require("../../src/refData/valueSets.json")

export const inputDataFor = (dn: number | CLUnknown, sd: number | CLUnknown, mp: string | CLUnknown): any =>
    ({
        payload: {
            v: [
                {
                    dn,
                    sd,
                    mp,
                    dt: Unknown,
                    tg: valueSets["disease-agent-targeted"][0],
                    ma: valueSets["vaccines-covid-19-auth-holders"][0],
                    vp: valueSets["sct-vaccines-covid-19"][0]
                }
            ],
            dob: "2000-01-01"   // assumption: at least 18 years since now
            // TODO  replace with an Unknown with a suitable predicate
        },
        external: {
            validationClock: Unknown,
            valueSets
        }
    })


export type Replacement = {
    subExpr: CertLogicExpression
    replacementExpr: CertLogicExpression
}


export const replaceSubExpression = (rootExpr: CertLogicExpression, replacements: Replacement[]): CertLogicExpression => {
    const replace = (expr: CertLogicExpression): CertLogicExpression => {
        const replaceIndex = replacements.findIndex((replacement) => deepEqual(replacement.subExpr, expr))
        if (replaceIndex !== -1) {
            return replacements[replaceIndex].replacementExpr
        }
        if (isCertLogicLiteral(expr)) {
            return expr
        }
        if (Array.isArray(expr)) {
            return expr.map(replace)
        }
        const [operator, operands] = operationDataFrom(expr)
        return operator === "var"
            ? expr
            : {
                [operator]: (operands as CertLogicExpression[]).map(replace)
            } as CertLogicOperation
    }
    return replace(rootExpr)
}

