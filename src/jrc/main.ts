/*
 * “Main” file that does all the work.
 */


import {join} from "path"

import {
    CountryInfo, FilteredCountryInfo, Indicator, IndicatorExtract, IndicatorMetadata
} from "./types"
import {sortArrayBy} from "../utils/func-utils"
import {dedup} from "../analyser/helpers"
import {JsonFile, writeHtml} from "../utils/file-utils"
import {filteredCountryInfosAsHtml} from "./html-renderer"


const jrcPath = join("tmp", "jrc")


const countryInfoFile = new JsonFile<CountryInfo[]>(join(jrcPath, "country-info.json"))
const countryInfo = countryInfoFile.contents


const extractMetadataFrom = ({ indicator_id, indicator_name, rules }: Indicator): IndicatorMetadata =>
    ({
        id: indicator_id,
        name: indicator_name,
        deps: rules
    })

const metadataFile = new JsonFile(join(jrcPath, "indicator-metadata.json"))
metadataFile.contents = sortArrayBy(
    dedup(
        countryInfo.flatMap(({ indicators }) =>
            indicators.map(extractMetadataFrom)
        )
    ),
    ({ id }) => id
)
console.log("Extracted metadata from all info.")


const containsTerms = (...terms: string[]): (indicator: Indicator) => boolean =>
    ({ indicator_name, comment }) =>
        terms.some((term) =>
            indicator_name.toLowerCase().indexOf(term) !== -1 || comment.toLowerCase().indexOf(term) !== -1
        )

const extractFrom = (indicator: Indicator): IndicatorExtract =>
    ({
        metadata: extractMetadataFrom(indicator),
        contents: indicator.comment
    })

const filteredCountryInfoFile = new JsonFile<FilteredCountryInfo[]>(join(jrcPath, "filtered-on-keywords.json"))
const filteredCountryInfo = countryInfo.map(({ nutscode, indicators }) =>
    ({
        nutscode,
        indicators: indicators
            .filter(containsTerms("booster", "certificate", "day", "dcc", "month", "valid", "vaccine"))
            .map(extractFrom)
    })
)
filteredCountryInfoFile.contents = filteredCountryInfo
console.log("Filtered all info on keywords.")


writeHtml(join(jrcPath, "jrc-filtered.html"), filteredCountryInfosAsHtml(filteredCountryInfo))
console.log("Presented keyword-filtered info as HTML.")

