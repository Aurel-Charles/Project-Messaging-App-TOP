import { getAllUsers, getPublicUserById } from "../db/queries/userQueries.js";
import { HttpError } from "../utils/httpErrorHandler.js";
import { isOnline } from "../utils/isOnline.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export async function getUsers(req, res) {
    const data = await getAllUsers()
    const users = data.map((u) => ({...u, isOnline : isOnline(u.lastSeenAt)}))
    res.json(users)
}

export async function getUser(req, res) {
    const id = parseIdParam(req.params.id)
    const data = await getPublicUserById(id)
    if (data === null) throw new HttpError("User not found", 404) 
    const user = {...data, isOnline : isOnline(data.lastSeenAt)}
    res.json(user)
}

