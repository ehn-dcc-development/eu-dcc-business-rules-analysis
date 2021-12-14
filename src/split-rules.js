const { join } = require("path")
const { normalCopyOf } = require("dcc-business-rules-utils")

const { mkDir, writeJson } = require("./file-utils")
const { renderAsText } = require("./render")


const allRules = require("../tmp/all-rules-exploded-IDs.json")

const map = {}
for (const rule of allRules) {
    if (!(rule.c in map)) {
        map[rule.c] = []
    }
    map[rule.c].push(rule)
}

/*
const comparatorFor = (propertyName) =>
    (leftObj, rightObj) => {
        const left = leftObj[propertyName]
        const right = rightObj[propertyName]
        return left === right
            ? 0
            : (left < right ? -1 : 1)
    }
 */

const normalised = (rule) => {
    const copy = normalCopyOf(rule, { t: rule.t, c: rule.c, n: rule.n })
    copy["expr-as-text"] = renderAsText(rule.Logic)
    return copy
}

for (const c in map) {
    const countryPath = join("per-country", c)
    mkDir(countryPath)
    for (const rule of map[c]) {
        if (new Date(rule.ValidTo) > new Date()) {
            writeJson(join(countryPath, `${rule.t}-${rule.n}.json`), normalised(rule))
        } else {
            console.warn(`skipped rule with id="${rule.Identifier}" because it's not valid anymore`)
        }
    }
}

