import { createFriendRequest, findFriendshipBetween } from "../db/queries/friendshipQueries.js"
import { getUserById } from "../db/queries/userQueries.js"
import { HttpError } from "../utils/httpErrorHandler.js"


export async function sendFriendRequest(req, res) {
    const receiverId = req.body.receiverId
    const requesterId = req.user.id
    if (receiverId === req.user.id) {
        throw new HttpError("You cannot add yourself", 400)
    }
    if (await getUserById(receiverId) ===  null) {
        throw new HttpError("User not found", 404)
    }
    let friendship
    friendship = await findFriendshipBetween(requesterId, receiverId)
    if (friendship !== null) {
        throw new HttpError('Request already sent', 409)
    }
    friendship = await createFriendRequest(requesterId, receiverId)
    res.status(201).json(friendship)
}