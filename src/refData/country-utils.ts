import {range} from "../utils/func-utils"


const charCodes = (str: string) =>
    range(str.length).map((idx) => str.charCodeAt(idx))

export const flagEmoji = (country: string) =>
    String.fromCodePoint(...(
        charCodes(country).map((charCode) => 127397 + charCode)
    ))


export const countryCode2DisplayName = require("../../src/refData/country-code-to-display-name.json")


const euMemberStates = [ "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK" ]
const euCandidateMemberStates = [ "AL", "ME", "MK", "RS", "TR" ]
const eeaPlusCountries = [ "IS", "LI", "NO" ]

export type MemberAnnotation =
    | "EU MS"
    | "EU candidate-MS"
    | "E{E|F}A MS"
    | "EFTA MS"
    | "3rd country"
export const memberAnnotation = (country: string): MemberAnnotation => {
    if (euMemberStates.indexOf(country) > -1) {
        return "EU MS"
    }
    if (euCandidateMemberStates.indexOf(country) > -1) {
        return "EU candidate-MS"
    }
    if (eeaPlusCountries.indexOf(country) > -1) {
        return "E{E|F}A MS"
    }
    if (country === "CH") {
        return "EFTA MS"
    }
    return "3rd country"
}


const country2CodeTo3Code_ = require("../../src/refData/country-2-code-to-3-code.json")

export const country2CodeTo3Code = (_2code: string): string => {
    if (_2code in country2CodeTo3Code_) {
        return country2CodeTo3Code_[_2code]
    }
    throw new Error(`3-code not input yet for country with 2-code "${_2code}"`)
}

