import {readJson, writeHtml, writeJson} from "./utils/file-utils"
import {unique} from "./utils/func-utils"
import {vaccineIds} from "./refData/vaccine-data"
import {infoAsHtml} from "./vaccine-centric-inventory-generator"
import {VaccineSpecs} from "./compute-vaccine-info"


const vaccineInfoPerCountry: VaccineSpecs = readJson("analysis/vaccine-info.json")

export type VaccineAcceptance = {
    vaccineId: string
    acceptingCountries: string[]
}

const acceptingCountriesPerVaccine: VaccineAcceptance[] = vaccineIds.map((vaccineId) =>
    ({
        vaccineId,
        acceptingCountries: vaccineInfoPerCountry.filter(({ vaccineSpecs }) =>
            vaccineSpecs.some((vaccineSpec) => vaccineSpec.vaccineIds.indexOf(vaccineId) > -1)
        ).map(({ country }) => country)
    })
)


writeJson("analysis/accepting-countries-per-vaccine.json", acceptingCountriesPerVaccine)

const countries = unique(acceptingCountriesPerVaccine.flatMap(({ acceptingCountries }) => acceptingCountries)).sort()

const html = infoAsHtml(acceptingCountriesPerVaccine, countries)
writeHtml("analysis/accepting-countries-per-vaccine.html", html)

