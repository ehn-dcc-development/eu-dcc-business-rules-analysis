import {CertLogicExpression, evaluate} from "certlogic-js"
import {renderAsCompactText} from "certlogic-js/dist/misc"
import {Rule, validateRule} from "dcc-business-rules-utils"

import {makeData} from "./data"
import {demoJson, toOut} from "./utils"


const runRuleWithId = (ruleId: string) => {

    // read rule:

    const rule: Rule = demoJson(ruleId)
    const expr: CertLogicExpression = rule.Logic

    toOut("validation", validateRule(rule))


    console.log(`rule's logic as compact text: ${renderAsCompactText(expr)}`)
    console.log()


    // compose data to run rule('s logic) against:

    const [data, now] = makeData()

    toOut("data", data)


    // evaluation:

    try {
        const result = evaluate(expr, data)
        console.log("result of evaluation of rule('s logic):")
        console.log()
        console.dir(result)
        toOut("evaluation", result)
    } catch (e: any) {
        console.error(`evaluation threw an error: ${e.message}`)
    }

    console.log()
    console.log()
    console.log(`ran: ${now}`)
}


runRuleWithId("VR-NL-0001")

