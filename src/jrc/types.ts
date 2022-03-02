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

export const containsTerms = (...terms: string[]): (indicator: Indicator) => boolean =>
    ({ indicator_name, comment }) =>
        terms.some((term) =>
            indicator_name.toLowerCase().indexOf(term) !== -1 || comment.toLowerCase().indexOf(term) !== -1
        )


export type IndicatorMetadata = {
    id: number
    name: string
    deps: number[]
}

export const extractMetadataFrom = ({ indicator_id, indicator_name, rules }: Indicator): IndicatorMetadata =>
    ({
        id: indicator_id,
        name: indicator_name,
        deps: rules
    })


export type IndicatorExtract = {
    metadata: IndicatorMetadata
    contents: string
}

export const extractFrom = (indicator: Indicator): IndicatorExtract =>
    ({
        metadata: extractMetadataFrom(indicator),
        contents: indicator.comment
    })


export type FilteredCountryInfo = {
    nutscode: string
    indicators: IndicatorExtract[]
}

