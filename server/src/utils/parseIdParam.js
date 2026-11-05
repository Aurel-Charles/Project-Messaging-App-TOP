import { HttpError } from "./httpErrorHandler.js"

export function parseIdParam(paramsId) {
    const id = Number(paramsId)
    if (!Number.isInteger(id) || id <= 0) {
        throw new HttpError('Invalid id', 400)
    }
    return id
}