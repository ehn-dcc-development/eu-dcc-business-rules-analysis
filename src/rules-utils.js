const parseId = (id) => {
    const match = id.match(/^([A-Z]+)-([A-Z]+)-([0-9]+)$/)
    return {
        t: match[1],
        c: match[2],
        n: match[3]
    }
}
module.exports.parseId = parseId

