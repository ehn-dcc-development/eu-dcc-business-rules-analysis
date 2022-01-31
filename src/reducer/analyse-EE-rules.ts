import {CertLogicExpression} from "certlogic-js"
import {and_} from "certlogic-js/dist/factories"
import { parseRuleId, Rule } from "dcc-business-rules-utils"

import {evaluateAbstractly} from "./abstract-interpreter"
import {Unknown} from "./abstract-types"
import {
    asCertLogicExpression,
    asCLValue,
    isTransformableToCertLogicExpression
} from "./transformers"
// const {writeJson} = require("../file-utils")
// const {groupBy, mapValues, sortBy} = require("../func-utils")

const allRules = require("../../tmp/all-rules.json")


const eeRules: CertLogicExpression[] = (allRules as Rule[])
    .filter((rule) => {
        const { country } = parseRuleId(rule.Identifier)
        return country === "EE"
    })
    .map((rule) => rule.Logic)

const data: any = {
    "payload": {
        "v": [
            {
                "dn": 2,
                "sd": 2,
                "mp": "EU/1/20/1528",
                "dt": Unknown,
                "tg": "840539006"
            }
        ]
    },
    "external": {
        "validationClock": Unknown
    }
}
data.external["valueSets"] = require("../valueSets.json")

const reducedRule = evaluateAbstractly(asCLValue(and_(...eeRules)), data)

console.log(
    isTransformableToCertLogicExpression(reducedRule)
        ? JSON.stringify(asCertLogicExpression(reducedRule), null, 4)
        : reducedRule
)

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
