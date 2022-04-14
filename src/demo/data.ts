import {demoJson} from "./utils"
import {readJson} from "../utils/file-utils"


export const makeData = (): [ data: any, now: string ] => {
    const exampleDCC = demoJson("example-DCC-payload")

    const now = new Date().toISOString()

    const metadata = demoJson("example-DCC-metaData")

    const valueSets = readJson("src/refData/valueSets.json")

    const data = {
        payload: exampleDCC,
        external: {
            validationClock: now,
            countryCode: "NL",
            ...metadata,
            valueSets
        }
    }

    return [data, now]
}

