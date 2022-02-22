import {and_} from "certlogic-js/dist/factories"
import {parseRuleId, Rule} from "dcc-business-rules-utils"

import {evaluateAbstractly} from "../reducer/abstract-interpreter"
import {isCertLogicExpression, Unknown} from "../reducer/abstract-types"
import {pretty} from "../utils/file-utils"
import {groupBy, mapValues} from "../utils/func-utils"
import {vaccineIds} from "../refData/vaccine-data"
import {analyse} from "./analyser"
import {validityAsText} from "./types"


const allRules: Rule[] = require("../../tmp/all-rules.json")
const valueSets = require("../../src/refData/valueSets.json")

const co = "NL"

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
    if (!isCertLogicExpression(reducedCertLogicExpr)) {
        console.warn(`not reducible: ${pretty(reducedCertLogicExpr)}`)
        return validityAsText(false)
    }
    // console.log(pretty(reducedCertLogicExpr))
    const validity = analyse(reducedCertLogicExpr)
    return validityAsText(validity)
}


const dn = 2, sd = 2;

console.log(`dn/sd = ${dn}/${sd}`)
console.dir(
    mapValues(
        groupBy(
            // [vaccineIds[12]] // (Pfizer)
            vaccineIds
                .map((vaccineId) => [ vaccineId, analyseRules(dn, sd, vaccineId) ]),
                // .filter(([ vaccineId, info ]) => info !== "x"),
            ([ _, info ]) => info
        ),
        (vs) => vs.map(([ vaccineId, _]) => vaccineId)
    )
)

// TODO  group by reduced CertLogic expression (over vaccines, then over combos)

