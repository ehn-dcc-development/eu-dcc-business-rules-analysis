import {readJson, writeJson} from "../utils/file-utils"
import {containsTerms, CountryInfo, extractFrom} from "./types"


const jrcOutput: CountryInfo[] = readJson("tmp/jrc.json")

writeJson(
    "tmp/jrc-filtered.json",
    jrcOutput.map(({ nutscode, indicators }) =>
        ({
            nutscode,
            indicators: indicators
                .filter(containsTerms("booster", "certificate", "day", "dcc", "month", "valid", "vaccine"))
                .map(extractFrom)
        })
    )
)

