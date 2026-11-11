import { deleteFriendshipById, findFriendshipBetween, getFriends } from "../db/queries/friendshipQueries.js";
import { HttpError } from "../utils/httpErrorHandler.js";
import { isOnline } from "../utils/isOnline.js";
import { parseIdParam } from "../utils/parseIdParam.js";


export async function getFriendsList(req, res) {
    const userId = req.user.id
    const friendships = await getFriends(userId)
    const friends = friendships.map((f)=> {
        const friend = f.requesterId === userId ? f.receiver : f.requester
        return { ...friend, isOnline: isOnline(friend.lastSeenAt) }
    })
    res.json(friends)
}

export async function removeFriend(req, res) {
    const userId = req.user.id
    const friendId = parseIdParam(req.params.userId)
    const friendship = await findFriendshipBetween(userId, friendId)
    if (friendship === null || friendship.status !== "ACCEPTED") {
        throw new HttpError("Friend not found", 404)
    }
    await deleteFriendshipById(friendship.id)
    res.status(204).end()
}

