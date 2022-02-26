import {applicableRuleVersions, Rule} from "dcc-business-rules-utils"
const deepEqual = require("deep-equal")

import {lowerTriangular} from "./utils/func-utils"
import {vaccineIds} from "./refData/vaccine-data"
import {ComboInfo, VaccineSpec} from "./json-files"
import {
    inputDataFor,
    Replacement,
    replaceSubExpression
} from "./analyser/helpers"
import {pretty, readJson} from "./utils/file-utils"
import {and_} from "certlogic-js/dist/factories"
import {evaluateAbstractly} from "./reducer/abstract-interpreter"
import {isCertLogicExpression} from "./reducer/abstract-types"
import {analyse} from "./analyser/analyser"
import {isUnanalysable, validityAsCombo} from "./analyser/types"



const validationClock = new Date("2022-03-01T13:37:00Z")


const replacementsPerCountry: { [country: string]: Replacement[] } = readJson("src/analyser/replacements.json")

const infoForCombo = (rules: Rule[], co: string, mp: string, dn: number, sd: number): ComboInfo => {
    const andCertLogicExpr = and_(
        ...applicableRuleVersions(rules, co, "Acceptance", validationClock)
            .map((rule) => rule.Logic)
    )  // and(...all applicable versions of Acceptance rules...)
    const reducedCertLogicExpr = evaluateAbstractly(
        co in replacementsPerCountry
            ? replaceSubExpression(andCertLogicExpr, replacementsPerCountry[co])
            : andCertLogicExpr,
        inputDataFor(dn, sd, mp)
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
    return validityAsCombo(validity)
}


const specForVaccine = (rules: Rule[], co: string, mp: string): VaccineSpec => {
    console.log(`\t\tmp="${mp}"`)
    return {
        vaccineIds: [mp],
        combos: Object.fromEntries(
            lowerTriangular(6).map(([ i, j ]) =>
                [ `${i+1}/${j+1}`, infoForCombo(rules, co, mp, i + 1, j + 1) ]
            )
        )
    }
}


const isNotAccepted = (vaccineSpec: VaccineSpec): boolean =>
    Object.values(vaccineSpec.combos).every((comboValue) => comboValue === null)
const removeUnaccepted = (vaccineSpecs: VaccineSpec[]): VaccineSpec[] =>
    vaccineSpecs.filter((vaccineSpec) => !isNotAccepted(vaccineSpec))


const dedupEqualSpecs = (vaccineSpecs: VaccineSpec[]): VaccineSpec[] => {
    const dedupped: VaccineSpec[] = []
    for (const vaccineSpec of vaccineSpecs) {
        const dedupCandidate = dedupped.find((candidate) => deepEqual(candidate.combos, vaccineSpec.combos))
        if (dedupCandidate) {
            dedupCandidate.vaccineIds.push(...vaccineSpec.vaccineIds)
        } else {
            dedupped.push(vaccineSpec)
        }
    }
    return dedupped
}


const optimise = (vaccineSpecs: VaccineSpec[]): VaccineSpec[] =>
    dedupEqualSpecs(removeUnaccepted(vaccineSpecs))


export const vaccineSpecsFromRules = (rules: Rule[], co: string): VaccineSpec[] => {
    console.log(`\tcountry=${co}`)
    return optimise(
        vaccineIds.map((mp) => specForVaccine(rules, co, mp))
    )
}

