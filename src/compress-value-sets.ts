import {readJson, writeJson} from "./file-utils"

const uncompressedValueSets = readJson("tmp/valueSets-uncompressed.json")
const compressedValueSets = Object.fromEntries(
    [   // keep previous selection and order explicitly:
        "country-2-codes",
        "disease-agent-targeted",
        "covid-19-lab-test-manufacturer-and-name",
        "covid-19-lab-result",
        "covid-19-lab-test-type",
        "vaccines-covid-19-auth-holders",
        "vaccines-covid-19-names",
        "sct-vaccines-covid-19"
    ].map(
        (valueSetId) =>
            [ valueSetId, Object.keys(uncompressedValueSets[valueSetId]).sort() ]
    )
)
writeJson("src/valueSets.json", compressedValueSets)

