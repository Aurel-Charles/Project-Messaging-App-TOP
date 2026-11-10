import { prisma } from "../prisma.js";

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::://
// Internal Queries , ONLY for internal usage => return with password
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::://

export async function getUserWithPasswordByEmail(email) {
    const user = await prisma.user.findUnique({
        where: {email},
    })
    return user
}
export async function getUserWithPasswordById(id) {
    const user = await prisma.user.findUnique({
        where: {id},
    })
    return user
}


// ::::::::::::::::::::::::::::::::::::::::::::::::::::::://
// Private Queries , use omit to return field without pasword
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::://

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
        data: {lastSeenAt: new Date()},
        omit : {password : true}
    })
    return user
}

export async function updateUserById(id, data) {
    const user = await prisma.user.update({
        where: {id},
        data,
        omit : {
            password : true
        }
    })
    return user
}



// ::::::::::::::::::::::::::::::::::::::::::::::::::::::://
// public Queries , use a const of public fields in select to return fields 
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::://
export const publicUserFields = {
    id: true,
    firstname: true,
    lastname: true,
    avatarUrl: true,
    lastSeenAt: true
}
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::://


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