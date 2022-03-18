import {Rule} from "dcc-business-rules-utils"
import {lt} from "semver"

import {groupBy, sortByStringKey} from "./utils/func-utils"
import {
    allRulesFile, rulesVersionMetadataFile,
    RulesVersionsMetadataPerCountry, RuleWithVersions, Versioning,
} from "./json-files"


const ruleWithVersions = (rules: Rule[]): RuleWithVersions =>
    ({
        ruleId: rules[0].Identifier,
        versions: rules.map((rule) =>
            ({
                version: rule.Version,
                validFrom: rule.ValidFrom,
                validTo: rule.ValidTo
            })
        ).sort((l, r) => lt(l.version, r.version) ? 1 : -1)
    })

const latestVersionOf = ({ versions }: RuleWithVersions): Versioning =>
    versions[0]

const latest = (dates: string[]): string =>
    dates.reduce((l, r) => new Date(l) > new Date(r) ? l : r, "1970-01-01")

const earliest = (dates: string[]): string =>
    dates.reduce((l, r) => new Date(l) < new Date(r) ? l : r, "2040-01-01")

const rulesVersionsMetadataForCountry = (rules: Rule[]): RulesVersionsMetadataPerCountry => {
    const rulesVersionsMetadataPerRule = sortByStringKey(
        Object.values(
            groupBy(rules, (rule) => rule.Identifier)
        ).map(ruleWithVersions),
        (ruleMetadata) => ruleMetadata.ruleId
    )
    return {
        country: rules[0].Country,
        latestValidFrom: latest(rulesVersionsMetadataPerRule.map(latestVersionOf).map((versioning) => versioning.validFrom)),
        earliestValidTo: earliest(rulesVersionsMetadataPerRule.map(latestVersionOf).map((versioning) => versioning.validTo)),
        rulesVersionsMetadataPerRule
    }
}


const rulesVersionMetaData = sortByStringKey(
    Object.values(
        groupBy(allRulesFile.contents, (rule) => rule.Country)
    ).map(rulesVersionsMetadataForCountry),
    (countryMetadata) => countryMetadata.country
)

rulesVersionMetadataFile.contents = rulesVersionMetaData

