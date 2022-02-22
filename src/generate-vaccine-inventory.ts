import {readJson, writeHtml} from "./utils/file-utils"

import {VaccineSpecs} from "./compute-vaccine-info"
import {infoAsHtml} from "./inventory-generator"


const vaccineInfoPerCountry: VaccineSpecs = readJson("analysis/vaccine-info.json")

const html = infoAsHtml(vaccineInfoPerCountry)

writeHtml("analysis/vaccine-inventory.html", html)

