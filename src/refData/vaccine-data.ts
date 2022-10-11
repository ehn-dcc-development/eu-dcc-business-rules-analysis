const valueSets = require("../../src/refData/valueSets.json")

export const vaccineIds: string[] = [...valueSets["vaccines-covid-19-names"]].sort()


const vaccineId2PopularName: { [vaccineId: string]: string } = {
    "EU/1/20/1528": "Comirnaty (Pfizer/BioNTech)",
    "EU/1/20/1507": "Spikevax (Moderna)",
    "EU/1/21/1529": "Vaxzevria (AstraZeneca)",
    "EU/1/20/1525": "Jcovden (Janssen)",
    "EU/1/21/1618": "Nuvaxovid",
    "NVX-CoV2373": "Nuvaxovid (deprecated encoding)",
    "EU/1/21/1624": "Valneva"
}

export const vaccineIdToDisplayName = (vaccineId: string): string =>
    vaccineId2PopularName[vaccineId] || vaccineId

export const isEMAAuthorised = (vaccineId: string): boolean =>
    [ "EU/1/20/1528", "EU/1/20/1507", "EU/1/21/1529", "EU/1/20/1525", "EU/1/21/1618", "EU/1/21/1624" ].indexOf(vaccineId) !== -1

