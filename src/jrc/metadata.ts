import {readJson, writeJson} from "../utils/file-utils"
import {CountryInfo, extractMetadataFrom} from "./types"
import {dedup} from "../analyser/helpers"
import {sortArrayBy} from "../utils/func-utils"


const jrcOutput: CountryInfo[] = readJson("tmp/jrc.json")

writeJson(
    "tmp/indicator-metadata.json",
    sortArrayBy(
        dedup(
            jrcOutput.flatMap(({ nutscode, indicators }) =>
                indicators.map(extractMetadataFrom)
            )
        ),
        ({ id }) => id
    )
)

