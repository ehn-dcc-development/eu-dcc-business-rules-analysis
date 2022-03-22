import {existsSync, mkdirSync, PathLike, readFileSync, writeFileSync} from "fs"
import {format as prettify} from "prettier"


export const readString = (path: PathLike) => readFileSync(path, "utf8")
export const writeString = (path: PathLike, data: any) => writeFileSync(path, data, "utf8")

export const readJson = (path: PathLike) => JSON.parse(readString(path))
export const pretty = (data: any): string => JSON.stringify(data, null, 2)
export const writeJson = (path: PathLike, data: any) => writeString(path, pretty(data))

export const writeHtml = (path: PathLike, html: string) => {
    writeFileSync(
        path,
        prettify("<!DOCTYPE html>" + html, {parser: "html"})
    )
}

export const mkDir = (path: PathLike) => existsSync(path) || mkdirSync(path)


/**
 * Class to represent a JSON file “on disk”.
 * The `contents` getter reads the file from disk, and parses it.
 * The setter writes the given JSON to disk.
 */
export class JsonFile<T> {
    readonly path: PathLike
    constructor(path: PathLike) {
        this.path = path
    }
    get contents(): T {
        return readJson(this.path)
    }
    set contents(newContents: T) {
        writeJson(this.path, newContents)
    }
}

