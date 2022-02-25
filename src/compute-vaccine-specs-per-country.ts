import {writeJson} from "./utils/file-utils"
import {unique} from "./utils/func-utils"
import {allRulesFile, VaccineSpecsForCountry, vaccineSpecsPerCountryFile} from "./json-files"
import {vaccineSpecsFromRules} from "./vaccine-specs-per-country"


const nowInMs = () => new Date().getTime()
const startTime = nowInMs()


const allRules = allRulesFile.contents

const countries = unique(allRules.map((rule) => rule.Country))

const vaccineSpecsPerCountry: VaccineSpecsForCountry[] =
    countries.map((country) =>
        ({
            country,
            vaccineSpecs: vaccineSpecsFromRules(allRulesFile.contents, country)
        }))


const elapsedInMs = nowInMs() - startTime
console.log(`Computing vaccine info took ${Math.floor(elapsedInMs/1000)}s.${elapsedInMs%1000}ms.`)

writeJson(vaccineSpecsPerCountryFile.path, vaccineSpecsPerCountry)

