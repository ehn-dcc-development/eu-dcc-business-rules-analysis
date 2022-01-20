const { readJson, writeHtml } = require("./file-utils")

const { infoAsHtml } = require("./inventory-generator")


const vaccineInfoPerCountry = readJson("analysis/vaccine-info.json")

const html = infoAsHtml(vaccineInfoPerCountry)

writeHtml("analysis/vaccine-inventory.html", html)

