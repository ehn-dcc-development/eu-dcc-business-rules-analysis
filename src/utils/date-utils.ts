export const asISODate = (date: Date): string =>
    date.toISOString().substring(0, "dd-mm-yyyy".length)

