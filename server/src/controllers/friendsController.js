import { createFriendRequest, deleteFriendshipById, findFriendshipBetween, getFriendshipById, getReceivedRequests, getSentRequests, updateFriendshipStatus } from "../db/queries/friendshipQueries.js"
import { getUserById } from "../db/queries/userQueries.js"
import { HttpError } from "../utils/httpErrorHandler.js"
import { parseIdParam } from "../utils/parseIdParam.js"


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
    if (friendship !== null && friendship.status === "DECLINED") {
        await deleteFriendshipById(friendship.id)
    }
    else if (friendship !== null) {
        throw new HttpError('Request already sent', 409)
    }
    friendship = await createFriendRequest(requesterId, receiverId)
    res.status(201).json(friendship)
}

export async function getFriendRequests(req, res) {
    const userId = req.user.id
    const type = req.query.type
    let requests
    if (type === "sent") {
        requests = await getSentRequests(userId)
    }
    else if (!type || type === "received") {
        requests = await getReceivedRequests(userId)
    }
    res.status(200).json(requests)
}

export async function answerFriendRequest(req, res) {
    const id = parseIdParam(req.params.id)
    const status = req.body.status
    const request = await getFriendshipById(id)
    if (request === null) {
        throw new HttpError('No friend request found', 404)
    }
    if (request.receiverId !== req.user.id) {
        throw new HttpError("Only the receiver can answer this request", 403)
    }
    if (request.status !== "PENDING") {
        throw new HttpError("This request has already been completed", 409)
    }
    const updateFriendRequest = await updateFriendshipStatus(id,status)
    res.status(200).json(updateFriendRequest)
}

