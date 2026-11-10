import  request  from "supertest";
import { app } from "../app";
import { prisma } from "../db/prisma";


export async function resetDb(){
    await prisma.friendship.deleteMany()
    await prisma.chatMember.deleteMany()
    await prisma.message.deleteMany()
    await prisma.chat.deleteMany()
    await prisma.user.deleteMany()
}


export async function createLoggedAgent(overrides = {}) {
    const defaultUser = {
        firstname : "John", 
        lastname : "Doe",
        email : "j.doe@prisma.com", 
        password : "secret12",
        confirmPassword : "secret12"
    }
    const user = { ...defaultUser, ...overrides }

    const agent = request.agent(app)
    const res = await agent.post("/auth/register").send(user)
    return {agent, user: res.body}
}