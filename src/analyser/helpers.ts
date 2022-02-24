import deepEqual from "deep-equal"


export const dedup = <T>(things: T[]): T[] =>
    things.filter((thing, index) =>
        !things.slice(0, index).some((earlierThing) => deepEqual(thing, earlierThing))
    )

