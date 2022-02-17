export const tapLog = <T>(t: T) => {
    console.log(JSON.stringify(t, null, 2))
    return t
}

