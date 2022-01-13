const { readJson, writeHtml } = require("./file-utils")

const { infoAsHtml } = require("./inventory-generator")


const vaccineInfoPerCountry = readJson("per-country/vaccine-info.json")

const html = infoAsHtml(vaccineInfoPerCountry)

writeHtml("per-country/vaccine-inventory.html", html)

