import { prisma } from "../prisma.js";

export async function getUserByEmail(email) {
    const user = await prisma.user.findUnique({
        where: {email},
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

