const allRules = require("../tmp/all-rules-exploded-IDs.json")
const { validateRulesOfCountry } = require("./rules-checking")


const rulesPerCountry = {}

for (const rule of allRules) {
    if (!(rule.c in rulesPerCountry)) {
        rulesPerCountry[rule.c] = []
    }
    rulesPerCountry[rule.c].push(rule)
}

Object.entries(rulesPerCountry)
    .forEach(([ co, rules ]) => {
        console.log(`#invalids(${co})=${validateRulesOfCountry(rules, co)}`)
    })

