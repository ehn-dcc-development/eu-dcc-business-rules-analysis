export const asISODate = (date: Date): string =>
    date.toISOString().substring(0, "dd-mm-yyyy".length)


export const dateWithOffset = (dateStr: string, nDays: number): string => {
    const date = new Date(dateStr)
    date.setUTCDate(date.getUTCDate() + nDays)
    return asISODate(date)
}

