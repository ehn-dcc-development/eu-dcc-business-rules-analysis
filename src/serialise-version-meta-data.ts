import {parseRuleId, Rule} from "dcc-business-rules-utils"

import {writeJson} from "./utils/file-utils"
import {groupBy, mapValues, sortArrayBy, sortMapByKeys} from "./utils/func-utils"
import {allRulesFile, rulesVersionMetaDataFile, Versioning} from "./json-files"


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

const versioningFromMetaData = ({ version, validFrom, validTo }: RuleMetaData): Versioning =>
    ({ version, validFrom, validTo })


const rulesVersionMetaData = sortMapByKeys(
    mapValues(
        groupBy(allRulesFile.contents, (rule) => parseRuleId(rule.Identifier).country),  // group rules per country
        (rules) => mapValues(
            sortMapByKeys(
                groupBy(
                    rules.map(extractVersionMetaData),
                    (ruleMD) => ruleMD.id
                )
            ),
            (ruleVersions) => sortVersions(ruleVersions).map(versioningFromMetaData)
        )
    )
)

writeJson(rulesVersionMetaDataFile.path, rulesVersionMetaData)

