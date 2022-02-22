import {parseRuleId, Rule} from "dcc-business-rules-utils"

import {writeJson} from "./utils/file-utils"
import {groupBy, Map, mapValues, sortArrayBy, sortMapByKeys} from "./utils/func-utils"


const allRules: Rule[] = require("../tmp/all-rules.json")


export type Versioning = {
    version: string
    validFrom: string
    validTo: string
}

export type RuleMetaData = {
    id: string
} & Versioning

const extractVersionMetaData = (rule: Rule): RuleMetaData =>
    ({
        id: rule.Identifier,
        version: rule.Version,
        validFrom: rule.ValidFrom,
        validTo: rule.ValidTo
    })

const sortVersions = (rulesMD: RuleMetaData[]) =>
    sortArrayBy(rulesMD, (ruleMD) =>
        new Date(ruleMD.validFrom).getTime()
    ).reverse()

const removeId = ({ version, validFrom, validTo }: RuleMetaData): Versioning =>
    ({ version, validFrom, validTo })


export type RulesVersionMetaDataPerCountry = Map<Map<Versioning[]>>
const rulesVersionMetaData = sortMapByKeys(
    mapValues(
        groupBy(allRules, (rule) => parseRuleId(rule.Identifier).country),  // group rules per country
        (rules) => mapValues(
            sortMapByKeys(
                groupBy(
                    rules.map(extractVersionMetaData),
                    (ruleMD) => ruleMD.id
                )
            ),
            (ruleVersions) => sortVersions(ruleVersions).map(removeId)
        )
    )
)

writeJson("analysis/rules-version-meta-data.json", rulesVersionMetaData)

