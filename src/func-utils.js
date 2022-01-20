/**
 * Generates an integer range 0..(n-1).
 * @param n - the length of the integer range
 * @returns {number[]}
 */
const range = (n) =>
    [...Array(n).keys()]
module.exports.range = range


/**
 * Generates a list of pairs (i, j) with 0 <= j <= i <= n-1.
 * These can be thought of as the 0-based indices of the entries of a lower triangular matrix.
 *
 * Example:
 * [
 *  [ 0, 0 ],
 *  [ 1, 1 ], [ 1, 0 ],
 *  [ 2, 2 ], [ 2, 1 ], [ 2, 0 ],
 *  ...
 * ]
 *
 * Note that the 2nd/j index is in decreasing order.
 */
const lowerTriangular = (n) =>
    range(n).flatMap((i) =>
        range(i+1).reverse().map((j) =>
            [ i, j ]
        )
    )
module.exports.lowerTriangular = lowerTriangular


const groupBy = (array, keyFunc) =>
    array.reduce((acc, value) => {
        const key = keyFunc(value)
        if (acc[key] === undefined) {
            acc[key] = []
        }
        acc[key].push(value)
        return acc
    }, {})
module.exports.groupBy = groupBy

