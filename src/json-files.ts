import {Rule} from "dcc-business-rules-utils"
import {PathLike} from "fs"

import {readJson} from "./utils/file-utils"
import {Map} from "./utils/func-utils"


export class JsonFile<T> {
    readonly path: PathLike
    constructor(path: PathLike) {
        this.path = path
    }
    get contents(): T {
        return readJson(this.path)
    }
}


export const allRulesFile = new JsonFile<Rule[]>("tmp/all-rules.json")


export type RulesStatistics = {
    co: string
    n: number
    nAcceptance: number
    nInvalidation: number
}

export const rulesStatisticsFile = new JsonFile<RulesStatistics[]>("analysis/rules-statistics.json")


export type Versioning = {
    version: string
    validFrom: string
    validTo: string
}

export const rulesVersionMetaDataFile = new JsonFile<Map<Map<Versioning[]>>>("analysis/rules-version-metadata.json")


export type VaccineSpec = {
    vaccineIds: string[],
    combos: { [comboKey: string]: ComboInfo }
}

export type ComboInfo = null | number | [number, number]

export type VaccineSpecsForCountry = {
    country: string
    vaccineSpecs: VaccineSpec[]
}

export const vaccineSpecsPerCountryFile = new JsonFile<VaccineSpecsForCountry[]>("analysis/vaccine-specs-per-country.json")


export type VaccineAcceptance = {
    vaccineId: string
    acceptingCountries: string[]
}

export const vaccineCountryMatrixFile = new JsonFile<VaccineAcceptance[]>("analysis/vaccine-country-matrix.json")

