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

export async function deleteFriendshipById(id) {
    const friendship = await prisma.friendship.delete({
        where: {id}
    })
}

export async function getFriendshipById(id) {
    const friendship = await prisma.friendship.findUnique({
        where: {id}
    })
    return friendship
}

export async function updateFriendshipStatus(id, status) {
    const friendship = await prisma.friendship.update({
        where: {id}, 
        data: {status}
    })
    return friendship
}

export async function getFriends(userId) {
    const friendship = await prisma.friendship.findMany({
        where : {
            status: "ACCEPTED",
            OR: [
                {requesterId: userId},
                {receiverId: userId}
            ]
        },
        include: {
            requester: {select : publicUserFields},
            receiver: {select : publicUserFields}
        }
    })
    return friendship
}

