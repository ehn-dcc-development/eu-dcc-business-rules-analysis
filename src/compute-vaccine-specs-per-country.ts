import {parseRuleId} from "dcc-business-rules-utils"

import {writeJson} from "./utils/file-utils"
import {groupBy} from "./utils/func-utils"
import {vaccineSpecsFromRules} from "./vaccine-specs-per-country"
import {allRulesFile, VaccineSpecsForCountry, vaccineSpecsPerCountryFile} from "./json-files"


const vaccineRulesPerCountry =
    groupBy(
        allRulesFile.contents
            .filter((rule) => parseRuleId(rule.Identifier).type === "VR"),
                // TODO  don't select on type (as it can be inaccurate) when using partial evaluation
                //          (since true non-V-rules should evaluate rather trivially to true)
        (rule) => parseRuleId(rule.Identifier).country
    )

const nowInMs = () => new Date().getTime()
const startTime = nowInMs()

const vaccineSpecsPerCountry: VaccineSpecsForCountry[] =
    Object.entries(vaccineRulesPerCountry)
        .map(([ country, rules ]) => ({
            country,
            vaccineSpecs: vaccineSpecsFromRules(rules, country)
        }))

const elapsedInMs = nowInMs() - startTime
console.log(`Computing vaccine info took ${Math.floor(elapsedInMs/1000)}s.${elapsedInMs%1000}ms.`)

writeJson(vaccineSpecsPerCountryFile.path, vaccineSpecsPerCountry)

