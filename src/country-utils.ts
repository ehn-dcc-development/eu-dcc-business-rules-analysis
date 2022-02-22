import {range} from "./func-utils"


const charCodes = (str: string) =>
    range(str.length).map((idx) => str.charCodeAt(idx))

export const flagEmoji = (country: string) =>
    String.fromCodePoint(...(
        charCodes(country).map((charCode) => 127397 + charCode)
    ))


export const countryCode2DisplayName = require("../src/country-code-to-display-name.json")


const euMemberStates = [ "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK" ]
const euCandidateMemberStates = [ "AL", "ME", "MK", "RS", "TR" ]
const eeaPlusCountries = [ "IS", "LI", "NO" ]

export const memberAnnotation = (country: string) => {
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

