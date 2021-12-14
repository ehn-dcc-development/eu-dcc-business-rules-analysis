/**
 * Returns an array l_0, l_1, ..., l_n where:
 *
 *  boolArray changes from [false -> true, i is even; true -> false, i is odd] at the l_i-th index
 *
 * l_n is always the boolArray's length
 */
const rle  = (boolArray) => {
    const rleArray = []
    let currentValue = false
    for (let i = 0; i < boolArray.length; i++) {
        if (boolArray[i] !== currentValue) {
            rleArray.push(i)
            currentValue = boolArray[i]
        }
    }
    rleArray.push(boolArray.length)
    return rleArray
}
module.exports.rle = rle


/*
console.dir(rle([]))                // -> [0]
console.dir(rle([false]))           // -> [1]
console.dir(rle([false, false]))    // -> [2]
console.dir(rle([true]))            // -> [0,1]
console.dir(rle([true, true]))      // -> [0,2]

console.dir(rle([false, false, false, false, false, false, false, false, false])) // -> [9] ~ never valid/not accepted
console.dir(rle([false, false, false, true, true, true, true, true, true])) // -> [3, 9] ~ valid from 3rd day, for forever
console.dir(rle([false, false, false, true, true, true, true, false, false])) // -> [3, 7, 9] ~ valid from 3rd day, valid until 7th day

 */

