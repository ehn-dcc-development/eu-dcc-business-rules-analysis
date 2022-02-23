import {writeHtml, writeJson} from "./utils/file-utils"
import {unique} from "./utils/func-utils"
import {vaccineIds} from "./refData/vaccine-data"
import {acceptingCountriesPerVaccineAsHtml} from "./dashboard/vaccine-country-matrix"
import {
    VaccineAcceptance,
    vaccineCountryMatrixFile,
    vaccineSpecsPerCountryFile
} from "./json-files"



const acceptingCountriesPerVaccine: VaccineAcceptance[] = vaccineIds.map((vaccineId) =>
    ({
        vaccineId,
        acceptingCountries: vaccineSpecsPerCountryFile.contents.filter(({ vaccineSpecs }) =>
            vaccineSpecs.some((vaccineSpec) => vaccineSpec.vaccineIds.indexOf(vaccineId) > -1)
        ).map(({ country }) => country)
    })
)

writeJson(vaccineCountryMatrixFile.path, acceptingCountriesPerVaccine)


const countries = unique(acceptingCountriesPerVaccine.flatMap(({ acceptingCountries }) => acceptingCountries)).sort()

const html = acceptingCountriesPerVaccineAsHtml(acceptingCountriesPerVaccine, countries)
writeHtml("analysis/vaccine-country-matrix.html", html)

