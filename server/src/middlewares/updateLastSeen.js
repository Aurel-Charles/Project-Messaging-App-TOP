import { touchLastSeenById } from "../db/queries/userQueries.js"

export async function updateLastSeen(req, res, next) {
    const id = req.user.id
    await touchLastSeenById(id)
    next()
}