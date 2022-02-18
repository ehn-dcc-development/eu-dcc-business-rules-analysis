const { readJson, writeHtml, writeJson} = require("./file-utils")
const { unique } = require("./func-utils")
const { vaccineIds } = require("./vaccine-data")
const { infoAsHtml } = require("./vaccine-centric-inventory-generator")


const vaccineInfoPerCountry = readJson("analysis/vaccine-info.json")

const acceptingCountriesPerVaccine = vaccineIds.map((vaccineId) =>
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

