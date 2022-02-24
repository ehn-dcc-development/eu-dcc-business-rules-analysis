import {CertLogicExpression, CertLogicOperation} from "certlogic-js"
import {and_} from "certlogic-js/dist/factories"
import {parseRuleId, Rule} from "dcc-business-rules-utils"
import deepEqual from "deep-equal"

import {evaluateAbstractly} from "../reducer/abstract-interpreter"
import {isCertLogicExpression, Unknown} from "../reducer/abstract-types"
import {isCertLogicLiteral} from "../reducer/helpers"
import {operationDataFrom} from "../utils/certlogic-utils"
import {pretty, readJson} from "../utils/file-utils"
import {groupBy, mapValues, unique} from "../utils/func-utils"
import {vaccineIds} from "../refData/vaccine-data"
import {analyse} from "./analyser"
import {isUnanalysable, validityAsText} from "./types"


const allRules: Rule[] = require("../../tmp/all-rules.json")
const valueSets = require("../../src/refData/valueSets.json")

const countries = unique(allRules.map((rule) => rule.Country))

/**
 * to investigate further && fix:
 *
 *  *  UA: produces an unanalysable for Janssen                             - fix by using a monoidal approach for making an interval
 */


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
            // TODO  replace with an Unknown with a suitable predicate
        },
        external: {
            validationClock: Unknown,
            valueSets
        }
    })


type Replacement = {
    subExpr: CertLogicExpression
    replacementExpr: CertLogicExpression
}

const replaceSubExpression = (rootExpr: CertLogicExpression, replacements: Replacement[]): CertLogicExpression => {
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


const replacementsPerCountry: { [country: string]: Replacement[] } = readJson("src/analyser/replacements.json")

const analyseRulesFor = (co: string, applicableRuleVersions: Rule[], dn: number, sd: number, mp: string): string => {
    const andCertLogicExpr = and_(...applicableRuleVersions.map((rule) => rule.Logic))
    const certLogicExpr = co in replacementsPerCountry ? replaceSubExpression(andCertLogicExpr, replacementsPerCountry[co]) : andCertLogicExpr
    const reducedCertLogicExpr = evaluateAbstractly(certLogicExpr, makeData(dn, sd, mp))
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


const now = new Date()

const analyseRules = (co: string, dn: number, sd: number) => {

    const validRuleVersions: Rule[] = (allRules as Rule[])
        .filter((rule) => {
            const {country} = parseRuleId(rule.Identifier)
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

    // TODO  group by reduced CertLogic expression (over vaccines, then over combos)

    console.log(`dn/sd = ${dn}/${sd}`)
    console.dir(
        mapValues(
            groupBy(
                // [vaccineIds[12]] // (Pfizer)
                vaccineIds
                    .map((vaccineId) => [vaccineId, analyseRulesFor(co, applicableRuleVersions, dn, sd, vaccineId)]),
                // .filter(([ vaccineId, info ]) => info !== "x"),
                ([_, info]) => info
            ),
            (vs) => vs.map(([vaccineId, _]) => vaccineId)
        )
    )

}


countries.forEach((co) => {
    analyseRules(co, 2, 2)
})

