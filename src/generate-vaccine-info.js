const { evaluate } = require("certlogic-js")
const deepEqual = require("deep-equal")

const { writeJson } = require("./file-utils")
const { rle } = require("./rle-util")


const allRules = require("../tmp/all-rules-exploded-IDs.json")


const vaccineRulesPerCountry = {}


for (const rule of allRules) {
    if (rule.t === "VR" && new Date(rule.ValidFrom) < new Date()) {
        if (!(rule.c in vaccineRulesPerCountry)) {
            vaccineRulesPerCountry[rule.c] = []
        }
        vaccineRulesPerCountry[rule.c].push(rule.Logic)
    }
}


const valueSets = require("./valueSets.json")


const inputDataFrom = (mp, dt, dn, sd, nowDate) => ({
    payload: {
        v: [
            {
                mp, dt, dn, sd,
                tg: valueSets["disease-agent-targeted"][0],
                ma: valueSets["vaccines-covid-19-auth-holders"][0],
                vp: valueSets["sct-vaccines-covid-19"][0]
            }
        ]
    },
    external: {
        valueSets,
        validationClock: `${nowDate}T13:37:00Z` // somewhere middle of the day
    }
})


const safeEvaluate = (expr, data) => {
    try {
        return evaluate(expr, data)
    } catch (e) {
        console.error(`exception thrown during evaluation of CertLogic expression: ${e.message}`)
        console.dir(expr)
        console.dir(data)
    }
}

const acceptedByVaccineRules = (co, mp, dt, dn, sd, nowDate) =>
    vaccineRulesPerCountry[co].every((rule) => safeEvaluate(rule, inputDataFrom(mp, dt, dn, sd, nowDate)))


const range = (n) => {
    const arr = []
    for (let i = 0; i <= n; i++) {
        arr.push(i)
    }
    return arr
}


const dateWithOffset = (dateStr, nDays) => {
    const date = new Date(dateStr)
    date.setUTCDate(date.getUTCDate() + nDays)
    return date.toISOString().substring(0, "dd-mm-yyyy".length)
}



const infoForCombo = (co, mp, dn, sd) => {
    const validFrom = "2022-01-01"
    const acceptance = range(2*366 + 1).map((nDays) =>
        acceptedByVaccineRules(co, mp, validFrom, dn, sd, dateWithOffset(validFrom, nDays))
    )
    const rleAcceptance = rle(acceptance)

    const checkValidFrom = "2022-03-01"
    const checkAcceptance = range(2*366 + 1).map((nDays) =>
        acceptedByVaccineRules(co, mp, checkValidFrom, dn, sd, dateWithOffset(checkValidFrom, nDays))
    )
    const checkRleAcceptance = rle(checkAcceptance)
    if (!deepEqual(rleAcceptance, checkRleAcceptance)) {
        console.log(`[ERROR] business rules for country "${co}", vaccine "${mp}", and ${dn}/${sd} are not invariant under datetime translations!`)
    }

    switch (rleAcceptance.length) {
        case 1: return null // not accepted
        case 2: return rleAcceptance[0]
        case 3: return [ rleAcceptance[0], rleAcceptance[1] ]
        default: throw new Error(`unexpected RLE: ${rleAcceptance}`)
    }
}


const infoForVaccine = (co, mp) => ({
    vaccineIds: [mp],
    combos: {
        "1/1": infoForCombo(co, mp, 1, 1),
        "2/2": infoForCombo(co, mp, 2, 2),
        "2/1": infoForCombo(co, mp, 2, 1),
        "3/3": infoForCombo(co, mp, 3, 3),
        "3/2": infoForCombo(co, mp, 3, 2),
        "4/4": infoForCombo(co, mp, 4, 4)
    }
})


const vaccineIds = require("./valueSets.json")["vaccines-covid-19-names"]

const infoForCountry = (co) => vaccineIds.map((mp) => infoForVaccine(co, mp))


const isNotAccepted = (vaccineInfo) => Object.values(vaccineInfo.combos).every((comboValue) => comboValue === null)
const removeUnaccepted = (countryInfo) => countryInfo.filter((vaccineInfo) => !isNotAccepted(vaccineInfo))


const dedupEqualSpecs = (countryInfo) => {
    const dedupped = []
    for (const vaccineInfo of countryInfo) {
        const dedupCandidate = dedupped.find((candidate) => deepEqual(candidate.combos, vaccineInfo.combos))
        if (dedupCandidate) {
            dedupCandidate.vaccineIds.push(...vaccineInfo.vaccineIds)
        } else {
            dedupped.push(vaccineInfo)
        }
    }
    return dedupped
}


const optimise = (countryInfo) => dedupEqualSpecs(removeUnaccepted(countryInfo))


const infoPerCountry = Object.keys(vaccineRulesPerCountry)
    .map((country) => ({
        country,
        vaccineSpecs: optimise(infoForCountry(country))
    }))

writeJson("per-country/vaccine-info.json", infoPerCountry)

