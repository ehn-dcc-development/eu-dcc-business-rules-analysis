import {Rule, RuleValidationResult} from "dcc-business-rules-utils"
import {PathLike} from "fs"

import {readJson, writeJson} from "./utils/file-utils"


export class JsonFile<T> {
    readonly path: PathLike
    constructor(path: PathLike) {
        this.path = path
    }
    get contents(): T {
        return readJson(this.path)
    }
    set contents(newContents: T) {
        writeJson(this.path, newContents)
    }
}


export const allRulesFile = new JsonFile<Rule[]>("tmp/all-rules.json")


export type RulesStatistics = {
    co: string
    n: number
    nAcceptance: number
    nInvalidation: number
}

export const rulesStatisticsFile = new JsonFile<RulesStatistics[]>("analysis/statistics.json")


export const uploadingCountriesFile = new JsonFile<string[]>("analysis/countries.json")


export type RulesVersionsMetadataPerCountry = {
    country: string
    latestValidFrom: string
    earliestValidTo: string
    rulesVersionsMetadataPerRule: RuleWithVersions[]
}

export type RuleWithVersions = {
    ruleId: string
    versions: Versioning[]
}

export type Versioning = {
    version: string
    validFrom: string
    validTo: string
}

export const rulesVersionMetadataFile = new JsonFile<RulesVersionsMetadataPerCountry[]>("analysis/version-metadata.json")


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


export type ExtRuleValidationResult = RuleValidationResult & {
    logicWarnings: string[]
    version: string
}

export type ValidationResultForCountry = {
    country: string
    rulesWithValidationProblems: ExtRuleValidationResult[]
    ruleSetProblems: string[]
}

export const validationResultsFile = new JsonFile<ValidationResultForCountry[]>("analysis/validation-results.json")

