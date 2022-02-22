const valueSets = require("../../src/refData/valueSets.json")

export const vaccineIds: string[] = [...valueSets["vaccines-covid-19-names"]].sort()


const vaccineId2PopularName: { [vaccineId: string]: string } = {
    "EU/1/20/1528": "Comirnaty (Pfizer/BioNTech)",
    "EU/1/20/1507": "Spikevax (Moderna)",
    "EU/1/21/1529": "Vaxzevria (AstraZeneca)",
    "EU/1/20/1525": "Janssen",
    "EU/1/21/1618": "Nuvaxovid",
    "NVX-CoV2373": "Nuvaxovid (deprecated encoding)"
}

export const vaccineIdToDisplayName = (vaccineId: string): string =>
    vaccineId2PopularName[vaccineId] || vaccineId

export const vaccineIdToShortDisplayName = (vaccineId: string): string => {
    const displayName = vaccineIdToDisplayName(vaccineId)
    const idx = displayName.indexOf(" ")
    return idx < 1 ? displayName : displayName.substring(0, idx-1)
}

