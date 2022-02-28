/**
 * Generates an integer range 0..(n-1).
 * @param n - the length of the integer range
 * @returns {number[]}
 */
export const range = (n: number): number[] =>
    [...Array(n).keys()]


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
export const lowerTriangular = (n: number): number[][] =>
    range(n).flatMap((i) =>
        range(i+1).reverse().map((j) =>
            [ i, j ]
        )
    )


export type Map<V> = { [key: string]: V }

export const groupBy = <T>(array: T[], keyFunc: (t: T) => string): Map<T[]> =>
    array.reduce((acc: Map<T[]>, value) => {
        const key = keyFunc(value)
        if (acc[key] === undefined) {
            acc[key] = []
        }
        acc[key].push(value)
        return acc
    }, {})


export const mapValues = <V, W>(map: Map<V>, valueFunc: (v: V) => W): Map<W> =>
    Object.fromEntries(
        Object.entries(map)
            .map(([ key, value ]) => [ key, valueFunc(value) ])
    )


export const sortArrayBy = <T>(array: T[], keyFunc: (t: T) => number) =>
    [ ...array ].sort((l, r) => keyFunc(l) - keyFunc(r))


export const unique = <T>(things: T[]): T[] =>
    [...new Set(things)]


const stringCompare = (l: string, r: string): number =>
    l === r ? 0 : (l > r ? 1 : -1)

export const sortByStringKey = <T>(ts: T[], keyFunc: (t: T) => string) =>
    [...ts].sort((l, r) => stringCompare(keyFunc(l), keyFunc(r)))

