import {CertLogicExpression} from "certlogic-js"
import {and_} from "certlogic-js/dist/factories"
import {parseRuleId, Rule} from "dcc-business-rules-utils"

import {evaluateAbstractly} from "./abstract-interpreter"
import {Unknown} from "./abstract-types"
import {extractRangeEnds, rangeEndsAsText} from "./analyser"

const allRules = require("../../tmp/all-rules.json")
const valueSets = require("../valueSets.json")

const {writeJson} = require("../file-utils")

const co = "NL"

const rules: Rule[] = (allRules as Rule[])
    .filter((rule) => {
        const { country } = parseRuleId(rule.Identifier)
        return country === co// && rule.Identifier === "GR-NL-0000"
    })
    .sort((l, r) => l.Identifier < r.Identifier ? -1 : 1)   // === 0 isn't hit because they're IDs

// console.log(rules.map((rule) => rule.Identifier))

const makeData = (dn: number, sd: number, mp: string): any =>
    ({
        payload: {
            v: [
                {
                    dn,
                    sd,
                    mp,
                    dt: Unknown,
                    tg: "840539006"
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

    // console.log(`reduced rule:`)
    // console.log(JSON.stringify(reducedCertLogicExpr, null, 4))

    const rangeEnds = extractRangeEnds(reducedCertLogicExpr as CertLogicExpression)
    // console.dir(rangeEnds)
    return rangeEndsAsText(rangeEnds!)
}

const {vaccineIds} = require("../vaccine-data");

const dn = 2, sd = 2, vaccineId = "EU/1/20/1528"

writeJson(
    `analysis/${co}-rules.json`,
    Object.fromEntries(
        rules.map((rule) => [
            rule.Identifier,
            evaluateAbstractly(rule.Logic, makeData(dn, sd, vaccineId))
        ])
    )
)

// ;[vaccineId]
;vaccineIds
    .forEach((vaccineId: string) => {
        console.log(`${vaccineId} with ${dn}/${sd} => ${analyseRules(dn, sd, vaccineId)}`)
    })



/*
type ModifiedRule = {
    id: string
    version: string
    validTo: string
    validFrom: string
    logic: any//CertLogicExpression
}

const modifiedRules: ModifiedRule[] = vrEeRules
    .map((rule: Rule) => ({
        id: rule.Identifier,
        version: rule.Version,
        validTo: rule.ValidTo,
        validFrom: rule.ValidFrom,
        logic: evaluateAbstractly(asCLValue(rule.Logic), {
            "payload": {
                "v": [
                    {
                        "dn": 2,
                        "sd": 2,
                        "mp": "EU/1/20/1528"
                    }
                ]
            }
        })
    }))

const groupedRules = mapValues(
    groupBy(
        modifiedRules,
        (rule: ModifiedRule) => rule.id
    ),
    (ruleVersions: ModifiedRule[]) => sortBy(ruleVersions, (ruleVersion: ModifiedRule) => ruleVersion.version).reverse()
)

writeJson("tmp/modified-vacc-EE-rules.json", groupedRules)

 */
