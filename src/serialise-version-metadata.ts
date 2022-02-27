import {Rule} from "dcc-business-rules-utils"

import {writeJson} from "./utils/file-utils"
import {groupBy, sortArrayBy} from "./utils/func-utils"
import {
    allRulesFile, rulesVersionMetadataFile,
    RulesVersionsMetadataPerCountry, RuleWithVersions,
} from "./json-files"


const stringCompare = (l: string, r: string): number =>
    l === r ? 0 : (l > r ? 1 : -1)

const sortByStringKey = <T>(ts: T[], keyFunc: (t: T) => string) =>
    [...ts].sort((l, r) => stringCompare(keyFunc(l), keyFunc(r)))


const ruleWithVersions = (rules: Rule[]): RuleWithVersions =>
    ({
        ruleId: rules[0].Identifier,
        versions: sortArrayBy(
            rules.map((rule) =>
                ({
                    version: rule.Version,
                    validFrom: rule.ValidFrom,
                    validTo: rule.ValidTo
                })
            ),
            (versioning) => new Date(versioning.validFrom).getTime()
        ).reverse()
    })

const rulesVersionsMetadataForCountry = (rules: Rule[]): RulesVersionsMetadataPerCountry =>
    ({
        country: rules[0].Country,
        rulesVersionsMetadataPerRule:
            sortByStringKey(
                Object.values(
                    groupBy(rules, (rule) => rule.Identifier)
                ).map(ruleWithVersions),
                (ruleMetadata) => ruleMetadata.ruleId
            )
    })


const rulesVersionMetaData = sortByStringKey(
    Object.values(
        groupBy(allRulesFile.contents, (rule) => rule.Country)
    ).map(rulesVersionsMetadataForCountry),
    (countryMetadata) => countryMetadata.country
)

writeJson(rulesVersionMetadataFile.path, rulesVersionMetaData)

