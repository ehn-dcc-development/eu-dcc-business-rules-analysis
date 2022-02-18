const valueSets = require("./valueSets.json")

const vaccineIds = [...valueSets["vaccines-covid-19-names"]].sort()
module.exports.vaccineIds = vaccineIds


const vaccineId2PopularName = {
    "EU/1/20/1528": "Comirnaty (Pfizer/BioNTech)",
    "EU/1/20/1507": "Spikevax (Moderna)",
    "EU/1/21/1529": "Vaxzevria (AstraZeneca)",
    "EU/1/20/1525": "Janssen",
    "EU/1/21/1618": "Nuvaxovid",
    "NVX-CoV2373": "Nuvaxovid (deprecated encoding)"
}

const vaccineIdToDisplayName = (vaccineId) =>
    vaccineId2PopularName[vaccineId] || vaccineId
module.exports.vaccineIdToDisplayName = vaccineIdToDisplayName

const vaccineIdToShortDisplayName = (vaccineId) => {
    const displayName = vaccineIdToDisplayName(vaccineId)
    const idx = displayName.indexOf(" ")
    return idx < 1 ? displayName : displayName.substring(0, idx-1)
}
module.exports.vaccineIdToShortDisplayName = vaccineIdToShortDisplayName

