import {parseRuleId, Rule} from "dcc-business-rules-utils"

import {writeJson} from "./utils/file-utils"
import {groupBy} from "./utils/func-utils"
import {VaccineSpec, vaccineSpecsFromRules} from "./vaccine-info"


const allRules: Rule[] = require("../tmp/all-rules.json")

const vaccineRulesPerCountry =
    groupBy(
        allRules
            .filter((rule) => parseRuleId(rule.Identifier).type === "VR"),
                // TODO  don't select on type (as it can be inaccurate) when using partial evaluation
                //          (since true non-V-rules should evaluate rather trivially to true)
        (rule) => parseRuleId(rule.Identifier).country
    )

const nowInMs = () => new Date().getTime()
const startTime = nowInMs()

const infoPerCountry: VaccineSpecs = Object.entries(vaccineRulesPerCountry)
    .map(([ country, rules ]) => ({
        country,
        vaccineSpecs: vaccineSpecsFromRules(rules, country)
    }))

const elapsedInMs = nowInMs() - startTime
console.log(`Computing vaccine info took ${Math.floor(elapsedInMs/1000)}s.${elapsedInMs%1000}ms.`)

writeJson("analysis/vaccine-info.json", infoPerCountry)


export type VaccineSpecsForCountry = { country: string; vaccineSpecs: VaccineSpec[] }
export type VaccineSpecs = VaccineSpecsForCountry[]

