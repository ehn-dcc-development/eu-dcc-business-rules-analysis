import {compressValueSets} from "dcc-business-rules-utils"

import {readJson, writeJson} from "../utils/file-utils"


writeJson(
    "src/refData/valueSets.json",
    compressValueSets(readJson("tmp/valueSets-uncompressed.json"))
)

