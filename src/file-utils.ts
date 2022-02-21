import {existsSync, mkdirSync, PathLike, readFileSync, writeFileSync} from "fs"
import { format as prettify } from "prettier"


export const readString = (path: PathLike) => readFileSync(path, "utf8")
export const readJson = (path: PathLike) => JSON.parse(readString(path))

export const writeString = (path: PathLike, data: any) => writeFileSync(path, data, "utf8")
export const writeJson = (path: PathLike, data: any) => writeString(path, JSON.stringify(data, null, 2))

export const writeHtml = (path: PathLike, html: string) => {
    writeFileSync(
        path,
        prettify("<!DOCTYPE html>" + html, {parser: "html"})
    )
}

export const mkDir = (path: PathLike) => existsSync(path) || mkdirSync(path)

