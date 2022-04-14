import {and_} from "certlogic-js/dist/factories"
import {renderAsCompactText} from "certlogic-js/dist/misc"
import {Rule} from "dcc-business-rules-utils"

import {makeData} from "./data"
import {demoJson, toOut} from "./utils"
import {evaluatePartially, isCertLogicExpression, Unknown} from "certlogic-utils-js/dist/partial-evaluator"
import {analyse} from "../analyser/analyser"
import {replaceSubExpression} from "../analyser/helpers"
import {validityAsText} from "../analyser/types"


const ruleIds = [ "TR-NL-0004", "VR-NL-0001", "VR-NL-0006", "VR-NL-0007" ]

const rules: Rule[] = ruleIds.map(demoJson)


// combine all applicable rules:

const andRulesExpr = and_(...rules.map((rule) => rule.Logic))

console.log(`and(<<all rules>>) expression as compact text:\n\t${renderAsCompactText(andRulesExpr)}`)
console.log()

toOut("partial/and-rules-expression", andRulesExpr)


// mark values in data as unknown:

const [data, now] = makeData()

const vEvent = data.payload.v[0]
vEvent.mp = "EU/1/20/1528"              // Comirnaty = "Pfizer"
vEvent.dn = 2                           // vaccination 2...
vEvent.sd = 2                           // ...of 2 <=> primary course completed
vEvent.dt = Unknown                     // unknown vaccination date
data.external.validationClock = Unknown // unknown verification timestamp

toOut("partial/data", data.payload)


// evaluate without replacement:

const partialEvaluationWithoutReplacement = evaluatePartially(andRulesExpr, data)
toOut("partial/evaluation-without-replacement", partialEvaluationWithoutReplacement)
if (!isCertLogicExpression(partialEvaluationWithoutReplacement)) {
    throw Error(`not a CertLogic expression`)
}
toOut("partial/analysis-without-replacement", analyse(partialEvaluationWithoutReplacement))


// evaluate with replacement:

const replacedExpr = replaceSubExpression(
    partialEvaluationWithoutReplacement,
    [
        {
            subExpr: {
                "after": [
                    {
                        "dccDateOfBirth": [
                            {
                                "var": "payload.dob"
                            }
                        ]
                    },
                    {
                        "plusTime": [
                            {
                                "var": "external.validationClock"
                            },
                            -18,
                            "year"
                        ]
                    }
                ]
            },
            replacementExpr: false
        }
    ]
)
toOut("partial/replaced-expression", replacedExpr)


const partialEvaluationWithReplacement = evaluatePartially(replacedExpr, data)
toOut("partial/evaluation-with-replacement", partialEvaluationWithReplacement)
if (!isCertLogicExpression(partialEvaluationWithReplacement)) {
    throw Error(`not a CertLogic expression`)
}


// analyse evaluation with replacement:

const analysis = analyse(partialEvaluationWithReplacement)
toOut("partial/analysis-with-replacement", analysis)

console.log(`validity range (as text): ${validityAsText(analysis)}`)
console.log()


console.log(`ran: ${now}`)

