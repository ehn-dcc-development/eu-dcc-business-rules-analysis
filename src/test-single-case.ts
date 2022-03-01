import {evaluate} from "certlogic-js"
import {applicableRuleVersions, Rule} from "dcc-business-rules-utils"


const allRules: Rule[] = require("../tmp/all-rules.json")
const valueSets = require("../src/refData/valueSets.json")

const testSingleCase = (co: string, mp: string, dn: number, sd: number, dt: string, now: string) => {
    const applicableRuleVersions_ = applicableRuleVersions(allRules, co, "Acceptance", new Date(now))
    const data = {
        payload: {
            v: [
                {
                    dn,
                    sd,
                    mp,
                    dt,
                    tg: valueSets["disease-agent-targeted"][0],
                    ma: valueSets["vaccines-covid-19-auth-holders"][0],
                    vp: valueSets["sct-vaccines-covid-19"][0]
                }
            ],
            dob: "2000-01-01"   // assumption: at least 18 years since now
        },
        external: {
            validationClock: now,
            valueSets
        }
    }
    const andResult = applicableRuleVersions_.map((rule) => {
        const result = evaluate(rule.Logic, data)
        console.log(`rule ${rule.Identifier} (@${rule.Version}) -> ${result}`)
        return result
    }).reduce((l, r) => l && r)
    console.log(`DCC is ${andResult ? "" : "NOT "}accepted`)
}


if (process.argv.length < 6 + 2) {
    console.log(`Usage: node dist/test-case.js <country> <vaccine-ID> <dn> <sd> <dt> <now> - exiting`)
    process.exit(1)
}

const asPositiveInteger = (str: string, name: string): number => {
    const num = Number(str)
    if (isNaN(num)) {
        console.error(`"${str}" (=value of ${name}) is not an integer`)
        process.exit(1)
    }
    if (num <= 0) {
        console.error(`${num} (=value of ${name}) is not a positive integer`)
        process.exit(1)
    }
    return num
}

const asDateString = (str: string, name: string): string => {
    try {
        const date = new Date(str)
        date.toISOString()
        return str
    } catch (e) {
        console.error(`"${str}" (=value of ${name}) is not valid as a string representing a date`)
        process.exit(1)
    }
}


const country = process.argv[2]
if (valueSets["country-2-codes"].indexOf(country) === -1) {
    console.error(`"${country}" is not a valid country code`)
    process.exit(1)
}
const vaccineId = process.argv[3]
if (valueSets["vaccines-covid-19-names"].indexOf(vaccineId) === -1) {
    console.error(`"${vaccineId}" is not a valid vaccine ID`)
    process.exit(1)
}
const dn = asPositiveInteger(process.argv[4], "dn")
const sd = asPositiveInteger(process.argv[5], "sd")
const dt = asDateString(process.argv[6], "dt")
const now = asDateString(process.argv[7], "now")

testSingleCase(country, vaccineId, dn, sd, dt, now)

