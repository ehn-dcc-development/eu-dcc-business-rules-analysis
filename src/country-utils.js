const {range} = require("./func-utils")


const charCodes = (str) =>
    range(str.length).map((idx) => str.charCodeAt(idx))

const flagEmoji = (country) =>
    String.fromCodePoint(...(
        charCodes(country).map((charCode) => 127397 + charCode)
    ))
module.exports.flagEmoji = flagEmoji


const countryCode2DisplayName = require("./country-code-to-display-name.json")
module.exports.countryCode2DisplayName = countryCode2DisplayName


const euMemberStates = [ "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK" ]
const euCandidateMemberStates = [ "AL", "ME", "MK", "RS", "TR" ]
const eeaPlusCountries = [ "IS", "LI", "NO" ]

const memberAnnotation = (co) => {
    if (euMemberStates.indexOf(co) > -1) {
        return "EU MS"
    }
    if (euCandidateMemberStates.indexOf(co) > -1) {
        return "EU candidate-MS"
    }
    if (eeaPlusCountries.indexOf(co) > -1) {
        return "E{E|F}A MS"
    }
    if (co === "CH") {
        return "EFTA MS"
    }
    return "3rd country"
}
module.exports.memberAnnotation = memberAnnotation

