import { prisma } from "../prisma.js";

const publicUserFields = {
    id: true,
    firstname: true,
    lastname: true,
    profilePicture: true,
    lastSeenAt: true
}

export async function getUserWithPasswordByEmail(email) {
    const user = await prisma.user.findUnique({
        where: {email},
    })
    return user
}

export async function getUserByEmail(email) {
    const user = await prisma.user.findUnique({
        where: {email},
        omit: {password: true}
    })
    return user
}

export async function getUserById(id) {
    const user = await prisma.user.findUnique({
        where: {id},
        omit: {password: true}
    })
    return user
}



export async function createUser(data) {
    const user = await prisma.user.create({
        data,
        omit: {password: true}
    })
    return user
}


export async function touchLastSeenById(id) {
    const user = await prisma.user.update({
        where: {id},
        data: {
            lastSeenAt: new Date()
        }
    })
    return user
}

export async function getAllUsers() {
    const users = await prisma.user.findMany({
        select: publicUserFields,
        orderBy : {firstname : "asc"}
    })
    return users
}

export async function getPublicUserById(id) {
    const user = await prisma.user.findUnique({
        where: {id},
        select: publicUserFields
    })
    return user
}