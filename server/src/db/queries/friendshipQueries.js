import { prisma } from "../prisma.js";


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