export const externalAnchor = (url: string, linkText: string, showWhereOpens = true) =>
    `<a href="${url}" target="blank">${linkText}</a>${showWhereOpens ? " <small>(opens in a new window/tab)</small>" : ""}`


export const asDisplayList = (strings: string[], emptyListIndication = "(none)") =>
    strings.length === 0
        ? emptyListIndication
        : strings.join(", ")

