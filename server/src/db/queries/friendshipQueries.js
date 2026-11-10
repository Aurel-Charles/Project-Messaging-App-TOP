import { prisma } from "../prisma.js";
import { publicUserFields } from "./userQueries.js";


export async function findFriendshipBetween(userIdA, userIdB) {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                {requesterId: userIdA,receiverId : userIdB},
                {requesterId: userIdB,receiverId : userIdA,}
            ]
        }
    })
    return friendship
}

export async function createFriendRequest(requesterId, receiverId) {
    const friendship = await prisma.friendship.create({
        data:{
            requesterId,
            receiverId
        }
    })
    return friendship
}

export async function getReceivedRequests(userId) {
    const friendshipRequest = await prisma.friendship.findMany({
        where: {
            receiverId: userId,
            status: "PENDING"
        },
        include: {
            requester: {select: publicUserFields} 
        },
        orderBy : {createdAt : "desc"}
    })
    return friendshipRequest
}

export async function getSentRequests(userId) {
    const friendshipRequest = await prisma.friendship.findMany({
        where: {
            requesterId: userId,
            status: "PENDING"
        },
        include: {
            receiver: {select: publicUserFields} 
        },
        orderBy : {createdAt : "desc"}
    })
    return friendshipRequest
}

