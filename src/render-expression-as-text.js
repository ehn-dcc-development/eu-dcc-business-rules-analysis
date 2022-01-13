/*
const indent = (str, n = 1) => str
    .split(/[\n]/)
    .map((line) => "\t".repeat(n) + line)
    .join("\n")
 */

const renderAsText = (expr) => {
    if (Array.isArray(expr)) {
        return `[ ${expr.map(renderAsText).join(", ")} ]`
    }
    if (typeof expr === "object" && Object.entries(expr).length === 1) {
        const [ operator, operands ] = Object.entries(expr)[0]
        switch (operator) {
            case "var": return `/${operands}`
            case "if": return `if ${renderAsText(operands[0])} then ${renderAsText(operands[1])} else ${renderAsText(operands[2])}`
/*
return `if
${indent(renderAsText(operands[0]), 2)}
    then
${indent(renderAsText(operands[1]), 2)}
    else
${indent(renderAsText(operands[2]), 2)}`
 */
            case "===":
            case "and":
            case ">":
            case "<":
            case ">=":
            case "<=":
            case "in":
            case "+":
            case "after":
            case "before":
            case "not-after":
            case "not-before":
                return operands.map(renderAsText).map((r) => `(${r})`).join(` ${operator} `)
            case "!": return `not (${renderAsText(operands[0])})`
            case "plusTime": return `${renderAsText(operands[0])} ${operands[1] >= 0 ? "+" : ""}${operands[1]} ${operands[2]}${Math.abs(operands[1]) === 1 ? "" : "s"}`
            case "reduce": return `(${renderAsText(operands[0])}).reduce((current, accumulator) → ${renderAsText(operands[1])}, ${renderAsText(operands[2])})`
            case "extractFromUVCI": return `extract fragment ${operands[1]} from UVCI (${renderAsText(operands[0])})`
        }
    }
    // ultimate fall-back:
    return JSON.stringify(expr, null, 2)
}
module.exports.renderAsText = renderAsText

/*
 * Note: this performs the same function as the `renderAsCompactText` from the sub package certlogic-js/misc,
 * except for that this version doesn't wrap every sub expression in a parenthesis pair (`(&hellip;)`).
 */

