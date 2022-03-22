/*
 * Type definitions representing parts of the Re-open EU API's responses.
 */


export type CountryInfo = {
    /**
     * ISO 3166-1 alpha-3 country code (3 characters): {@see https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3}
     */
    nutscode: string
    indicators: Indicator[]
}

export type Indicator = {
    indicator_id: number
    indicator_name: string
    comment: string
    rules: number[]
}

export type IndicatorMetadata = {
    id: number
    name: string
    deps: number[]  // dependencies?
}

export type IndicatorExtract = {
    metadata: IndicatorMetadata
    contents: string
}

export type FilteredCountryInfo = {
    nutscode: string
    indicators: IndicatorExtract[]
}

