import {and_} from "certlogic-js/dist/factories"
import {parseRuleId, Rule} from "dcc-business-rules-utils"

import {evaluateAbstractly} from "../reducer/abstract-interpreter"
import {isCertLogicExpression, Unknown} from "../reducer/abstract-types"
import {pretty} from "../utils/file-utils"
import {groupBy, mapValues} from "../utils/func-utils"
import {vaccineIds} from "../refData/vaccine-data"
import {analyse} from "./analyser"
import {isUnanalysable, validityAsText} from "./types"


const allRules: Rule[] = require("../../tmp/all-rules.json")
const valueSets = require("../../src/refData/valueSets.json")

const co = "UA"
/**
 * to investigate further && fix:
 *
 *  *  LT: produces unanalysables now for some of the accepted vaccines     - requires being able to reduce “<date> + 18y < now” to true
 *  *  LV: &#10003; produces an unanalysable now for accepted vaccines      - if(<and(...)>, true, false) -> and(...)
 *  *  UA: produces an unanalysable for Janssen                             - fix by deduping (or using a more monoidal approach)
 */

const now = new Date()

const validRuleVersions: Rule[] = (allRules as Rule[])
    .filter((rule) => {
        const { country } = parseRuleId(rule.Identifier)
        return country === co
    })
    .filter((rule) =>
        new Date(rule.ValidFrom) <= now && now < new Date(rule.ValidTo)
    )

const applicableRuleVersions: Rule[] =
    Object.values(
        mapValues(
            groupBy(validRuleVersions, (rule) => rule.Identifier),
            (ruleVersions) => ruleVersions.reduce((acc, cur) => acc.Version > cur.Version ? acc : cur)
        )
    )
    .sort((l, r) => l.Identifier < r.Identifier ? -1 : 1)   // === 0 isn't hit because they're IDs

console.log(`applicable rule versions: ${applicableRuleVersions.map((rule) => `${rule.Identifier}@${rule.Version}`).join(", ")}`)


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
            ],
            dob: "2000-01-01"   // assumption: at least 18 years since now
        },
        external: {
            validationClock: Unknown,
            valueSets
        }
    })


const analyseRules = (dn: number, sd: number, mp: string): string => {
    const reducedCertLogicExpr = evaluateAbstractly(
        and_(...applicableRuleVersions.map((rule) => rule.Logic)),
        makeData(dn, sd, mp)
    )
    if (!isCertLogicExpression(reducedCertLogicExpr)) {
        console.error(`not reducible: ${pretty(reducedCertLogicExpr)}`)
        throw new Error(`Acceptance rules didn't reduce to a CertLogic expression with dn/sd=${dn}/${sd} and mp="${mp}"`)
    }
    const validity = analyse(reducedCertLogicExpr)
    if (isUnanalysable(validity)) {
        console.error(`reduced CertLogic expression: ${pretty(reducedCertLogicExpr)}`)
        console.error(`(attempt@)analysis: ${pretty(validity)}`)
        throw new Error(`reduced CertLogic expression could not be fully analysed, i.e. reduced to a Validity instance`)
    }
    return validityAsText(validity)
}


const dn = 2, sd = 2

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

