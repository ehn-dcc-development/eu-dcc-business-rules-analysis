import {CertLogicExpression} from "certlogic-js"
import {and_} from "certlogic-js/dist/factories"
import {parseRuleId, Rule} from "dcc-business-rules-utils"

import {evaluateAbstractly} from "../reducer/abstract-interpreter"
import {Unknown} from "../reducer/abstract-types"
import {extractRangeEnds, rangeEndsAsText} from "./analyser"
import {groupBy, mapValues} from "../func-utils"
import {vaccineIds} from "../vaccine-data"
import {pretty} from "../file-utils"


const allRules: Rule[] = require("../../tmp/all-rules.json")
const valueSets = require("../../src/valueSets.json")

const co = "FR"
/*
 * weird:
 *  FR  - incorrect range end derivation
 */

const now = new Date()

const applicableRuleVersions: Rule[] = (allRules as Rule[])
    .filter((rule) => {
        const { country } = parseRuleId(rule.Identifier)
        return country === co
    })
    .filter((rule) =>
        new Date(rule.ValidFrom) <= now && now < new Date(rule.ValidTo)
    )

const rules: Rule[] =
    Object.values(
        mapValues(
            groupBy(applicableRuleVersions, (rule) => rule.Identifier),
            (ruleVersions) => ruleVersions.reduce((acc, cur) => acc.Version > cur.Version ? acc : cur)
        )
    )
    .sort((l, r) => l.Identifier < r.Identifier ? -1 : 1)   // === 0 isn't hit because they're IDs

console.log(rules.map((rule) => `${rule.Identifier}@${rule.Version}`).join(", "))


const makeData = (dn: number, sd: number, mp: string): any =>
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
            ]
        },
        external: {
            validationClock: Unknown,
            valueSets
        }
    })


const analyseRules = (dn: number, sd: number, mp: string): string => {
    const reducedCertLogicExpr = evaluateAbstractly(
        and_(...rules.map((rule) => rule.Logic)),
        makeData(dn, sd, mp)
    )
    // console.log(pretty(reducedCertLogicExpr))
    const rangeEnds = extractRangeEnds(reducedCertLogicExpr as CertLogicExpression)
    // console.dir(rangeEnds)
    return rangeEndsAsText(rangeEnds)
}


const dn = 2, sd = 2;

console.log(`dn/sd = ${dn}/${sd}`)
console.dir(
    mapValues(
        groupBy(
            // [vaccineIds[0]]
            vaccineIds
                .map((vaccineId) => [ vaccineId, analyseRules(dn, sd, vaccineId) ]),
                // .filter(([ vaccineId, info ]) => info !== "x"),
            ([ _, info ]) => info
        ),
        (vs) => vs.map(([ vaccineId, _]) => vaccineId)
    )
)

