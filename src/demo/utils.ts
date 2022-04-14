import {join} from "path"

import {readJson, writeJson} from "../utils/file-utils"


const outDir = join("demo", "out")
export const toOut = (name: string, data: any) => {
    writeJson(join(outDir, `${name}.json`), data)
}

export const demoJson = (name: string) =>
    readJson(join("demo", `${name}.json`))

