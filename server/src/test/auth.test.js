import { afterAll, beforeEach, describe, expect, test } from "vitest";
import  request  from "supertest";
import { app } from "../app";
import { prisma } from "../db/prisma";


beforeEach(async()=> {
    await prisma.friendship.deleteMany()
    await prisma.chatMember.deleteMany()
    await prisma.message.deleteMany()
    await prisma.chat.deleteMany()
    await prisma.user.deleteMany()
})
afterAll(async()=> {
    await prisma.$disconnect()
})

describe('Register', ()=> {
    const user = {
        firstname : "John", 
        lastname : "Doe",
        email : "j.doe@prisma.com", 
        password : "secret12",
        confirmPassword : "secret12"
    }

    let res
    beforeEach(async()=> {
       res = await request(app).post("/auth/register").send(user)
    })
    test("Register and set cookie with a token",async ()=> {
        expect(res.status).toBe(201)
        expect(res.body.password).toBe(undefined)
        expect(res.headers["set-cookie"][0]).toContain("token")
        expect(res.headers["set-cookie"][0]).toContain("HttpOnly")
    })

    test("Register with email already taken",async ()=> {
        const res2 = await request(app).post("/auth/register").send(user)        
        expect(res2.status).toBe(409)
        expect(res2.body.error).toBe("Email is already taken")
    })

    test("Register with wrong confirmPassword",async ()=> {
        const res2 = await request(app).post("/auth/register").send({...user, confirmPassword: "other-password"})        
        expect(res2.status).toBe(400)
        expect(res2.body.errors[0].msg).toBe('Passwords do not match')
        expect(res2.headers["set-cookie"]).toBe(undefined)
    })
})

describe('Login', ()=> {
    const user = {
        firstname : "John", 
        lastname : "Doe",
        email : "j.doe@prisma.com", 
        password : "secret12",
        confirmPassword : "secret12"
    }

    beforeEach(async()=> {
       await request(app).post("/auth/register").send(user)
    })
    test("Login passes",async ()=> {
        const res = await request(app).post("/auth/login").send({email: user.email , password: user.password})
        expect(res.status).toBe(200)
        expect(res.body.password).toBe(undefined)
        expect(res.headers["set-cookie"][0]).toContain("token=")
        expect(res.headers["set-cookie"][0]).toContain("HttpOnly")
    })
    test("Login with wrong password",async ()=> {
        const res = await request(app).post("/auth/login").send({email: user.email , password: "wrong-password"})
        expect(res.status).toBe(401)
        expect(res.body.error).toBe("Email or Password is wrong")
        expect(res.headers["set-cookie"]).toBe(undefined)
    })
    test("Login with unknown email",async ()=> {
        const res = await request(app).post("/auth/login").send({email: "unknown-email@unkown.com" , password: user.password})
        expect(res.status).toBe(401)
        expect(res.body.error).toBe("Email or Password is wrong")
        expect(res.headers["set-cookie"]).toBe(undefined)
    })


})

describe('ME and logout', ()=> {
    const user = {
        firstname : "John", 
        lastname : "Doe",
        email : "j.doe@prisma.com", 
        password : "secret12",
        confirmPassword : "secret12"
    }

    beforeEach(async()=> {
        await request(app).post("/auth/register").send(user)
    })
    test("GET /me > connected",async ()=> {
        const agent = request.agent(app)
        await agent.post("/auth/login").send({email: user.email , password: user.password})
        const res = await agent.get("/auth/me")
        expect(res.status).toBe(200)
        expect(res.body.email).toBe(user.email)
    })
    test("GET /me without cookie",async ()=> {
        const res = await request(app).get("/auth/me")
        expect(res.status).toBe(401)
        expect(res.headers["set-cookie"]).toBe(undefined)
        expect(res.body.error).toBe("Login required")
    })
    test("Logout",async ()=> {
        const agent = request.agent(app)
        await agent.post("/auth/login").send({email: user.email , password: user.password})
        const resIn = await agent.get("/auth/me")
        expect(resIn.status).toBe(200)
        expect(resIn.body.email).toBe(user.email)
        const resOut = await agent.post("/auth/logout")
        expect(resOut.status).toBe(204)
        const res = await agent.get("/auth/me")
        expect(res.status).toBe(401)
    })
})