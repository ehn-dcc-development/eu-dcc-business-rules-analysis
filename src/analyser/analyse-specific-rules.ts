import {applicableRuleVersions, Rule} from "dcc-business-rules-utils"
// import {and_} from "certlogic-js/dist/factories"

import {evaluateAbstractly} from "../reducer/abstract-interpreter"
import {isCertLogicExpression, Unknown} from "../reducer/abstract-types"
import {makeData, Replacement, replaceSubExpression} from "./helpers"
import {pretty, readJson} from "../utils/file-utils"
import {vaccineIds, vaccineIdToDisplayName} from "../refData/vaccine-data"
import {analyse} from "./analyser";


const allRules: Rule[] = require("../../tmp/all-rules.json")
const replacementsPerCountry: { [country: string]: Replacement[] } = readJson("src/analyser/replacements.json")


const vaccineId = vaccineIds[12]
console.log(`${vaccineId}: ${vaccineIdToDisplayName(vaccineId)}`)
console.log()


const co = "DE"

const analyseRule = (rule: Rule): void => {
    const afterReplacements = co in replacementsPerCountry
        ? replaceSubExpression(rule.Logic, replacementsPerCountry[co])
        : rule.Logic
    const reducedCertLogicExpr = evaluateAbstractly(afterReplacements, makeData(Unknown, Unknown, vaccineId))
    if (reducedCertLogicExpr !== true) {
        console.log(`rule ID=${rule.Identifier}`)
        console.log(`reduced CertLogic expression:`)
        console.log(pretty(reducedCertLogicExpr))
        if (!isCertLogicExpression(reducedCertLogicExpr)) {
            console.log(`[WARN] reduced expression is not a valid CertLogic expression!:`)
        } else {
            console.log(`analysed reduced CertLogic expression:`)
            console.log(pretty(analyse(reducedCertLogicExpr)))
        }
        console.log()
    }
}

const applicableRuleVersions_ = applicableRuleVersions(allRules, co, "Acceptance", new Date())

applicableRuleVersions_
    .forEach(analyseRule)

