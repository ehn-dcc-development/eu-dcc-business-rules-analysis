const { parseRuleId } = require("dcc-business-rules-utils")

const { writeJson } = require("./file-utils")
const { groupBy, mapValues, sortArrayBy, sortMapByKeys } = require("./func-utils")


const allRules = require("../tmp/all-rules.json")


const extractVersionMetaData = (rule) =>
    ({
        id: rule.Identifier,
        version: rule.Version,
        validFrom: rule.ValidFrom,
        validTo: rule.ValidTo
    })

const sortVersions = (rulesMD) =>
    sortArrayBy(rulesMD, (ruleMD) => new Date(ruleMD.validFrom).getTime()).reverse()

const removeId = ({ version, validFrom, validTo }) =>
    ({ version, validFrom, validTo })


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

