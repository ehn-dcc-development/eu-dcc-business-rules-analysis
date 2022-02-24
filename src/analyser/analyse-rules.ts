import {CertLogicExpression, CertLogicOperation} from "certlogic-js"
import {and_} from "certlogic-js/dist/factories"
import {applicableRuleVersions, Rule} from "dcc-business-rules-utils"
import deepEqual from "deep-equal"

import {evaluateAbstractly} from "../reducer/abstract-interpreter"
import {
    CLUnknown,
    isCertLogicExpression,
    Unknown
} from "../reducer/abstract-types"
import {isCertLogicLiteral} from "../reducer/helpers"
import {operationDataFrom} from "../utils/certlogic-utils"
import {pretty, readJson} from "../utils/file-utils"
import {groupBy, mapValues, unique} from "../utils/func-utils"
import {vaccineIds} from "../refData/vaccine-data"
import {analyse} from "./analyser"
import {isUnanalysable, validityAsText} from "./types"


const allRules: Rule[] = require("../../tmp/all-rules.json")
const valueSets = require("../../src/refData/valueSets.json")


const makeData = (dn: number, sd: number, mp: string | CLUnknown): any =>
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

// TODO  1st reduce and(...all applicable versions of Acceptance rules...) with only replacements (from file) done
//  Problem: the result of that is currently not a CertLogic expression, due to some data accesses not reducing to CertLogic expressions.
//  Value: would improve performance (because replacements only being done once per country) + provides insight (?)

const applicableRuleVersionsAsExpressionForCombo = (applicableRuleVersions: Rule[], co: string, dn: number, sd: number): CertLogicExpression => {
    const andCertLogicExpr = and_(...applicableRuleVersions.map((rule) => rule.Logic))  // and(...all applicable versions of Acceptance rules...)
    const reducedCertLogicExpr = evaluateAbstractly(
        co in replacementsPerCountry
            ? replaceSubExpression(andCertLogicExpr, replacementsPerCountry[co])
            : andCertLogicExpr,
        makeData(dn, sd, Unknown)
    )
    if (!isCertLogicExpression(reducedCertLogicExpr)) {
        console.error(`not reducible: ${pretty(reducedCertLogicExpr)}`)
        throw new Error(`Acceptance rules didn't reduce to a CertLogic expression with dn/sd=${dn}/${sd}"`)
    }
    return reducedCertLogicExpr
}


const validityFor = (co: string, dn: number, sd: number, mp: string, preparedCertLogicExpr: CertLogicExpression, showDebug: boolean): string => {
    const reducedCertLogicExpr = evaluateAbstractly(preparedCertLogicExpr, makeData(dn, sd, mp))
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
    if (showDebug) {
        console.log(`co="${co}", mp="${mp}", dn/sd=${dn}/${sd}:`)
        console.log(pretty(reducedCertLogicExpr))
        console.log(pretty(validity))
    }
    return validityAsText(validity)
}


const analyseRulesOverVaccines = (co: string, dn: number, sd: number, preparedCertLogicExpr: CertLogicExpression, showDebug: boolean) =>
    mapValues(
        groupBy(
            // [vaccineIds[12]] // (Pfizer)
            vaccineIds
                .map((vaccineId) => [vaccineId, validityFor(co, dn, sd, vaccineId, preparedCertLogicExpr, showDebug)])
                .filter(([_, spec]) => spec !== "x"),
            ([_, spec]) => spec
        ),
        (vs) => vs.map(([vaccineId, _]) => vaccineId)
    )


const now = new Date()  // use current time to select rule versions

const analyseRules = (co: string, dn: number, sd: number, showDebug: boolean) => {

    const applicableRuleVersions_ = applicableRuleVersions(allRules, co, "Acceptance", now)

    if (co in replacementsPerCountry) {
        const nReplacements = replacementsPerCountry[co].length
        console.log(`\t! ${nReplacements} replacement${nReplacements === 1 ? "" : "s"} present for co=${co}`)
    }

    console.log(`applicable rule versions: ${applicableRuleVersions_.map((rule) => `${rule.Identifier}@${rule.Version}`).join(", ")}`)

    console.log(`dn/sd = ${dn}/${sd}`)
    const preparedCertLogicExpr = applicableRuleVersionsAsExpressionForCombo(applicableRuleVersions_, co, dn, sd)
    if (showDebug) {
        console.log(pretty(preparedCertLogicExpr))
    }
    console.dir(analyseRulesOverVaccines(co, dn, sd, preparedCertLogicExpr, showDebug))

}


const debugCliParam = "--show-debug"

if (process.argv.length >= 4) {
    const [dn, sd] = process.argv.slice(2, 4).map((n) => parseInt(n, 10))
    if (process.argv.length >= 5) {
        const co = process.argv[4]
        const showDebug = process.argv.length >= 6 && process.argv.indexOf(debugCliParam) !== -1
        analyseRules(co, dn, sd, showDebug)
    } else {
        const countries = unique(allRules.map((rule) => rule.Country))
        countries.forEach((co) => {
            analyseRules(co, dn, sd, false)
        })
    }
} else {
    console.log(`Usage: node ${__filename} <dn> <sd> [country] [${debugCliParam}]`)
}

