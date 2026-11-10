import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import  request  from "supertest";
import { app } from "../app";
import { prisma } from "../db/prisma";
import { createLoggedAgent, resetDb } from "./helper.js";

// Replace uploadImage with a fake version: no real upload to Supabase during tests.
// vi.mock is hoisted above the imports, so the controller receives this version.
const FAKE_AVATAR_URL = "https://fake.supabase.co/storage/v1/object/public/messaging-app/avatars/test.png"
vi.mock("../utils/uploadImage.js", () => ({
    uploadImage: vi.fn(async () => FAKE_AVATAR_URL)
}))


beforeEach(async()=> {
    await resetDb()
})
afterAll(async()=> {
    await prisma.$disconnect()
})



describe('GET /users', ()=> {
    let user1
    let user2

    beforeEach(async()=> {
        user1 = await createLoggedAgent() 
        user2 = await createLoggedAgent({email: "alice@matchesGlob.com", firstname: "Alice", lastname: "Dupont"}) 
    })
    test("Connected",async ()=> {
        const res = await user1.agent.get("/users")
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
    })
    test("No private data",async ()=> {
        const res = await user1.agent.get("/users")
        expect(res.status).toBe(200)
        res.body.forEach(user => {
            expect(user).not.toHaveProperty("password")
            expect(user).not.toHaveProperty("email")                
        });
    })
    test("isOnline",async ()=> {
        const res = await user1.agent.get("/users")
        expect(res.status).toBe(200)
        const requester = res.body.find((u)=> u.id === user1.user.id)
        expect(requester.isOnline).toBe(true)
    })
    test("Without cookie",async ()=> {
        const res = await request(app).get("/users")
        expect(res.status).toBe(401)
    })
})

describe('GET /users/:id', ()=> {
    let user1
    let user2

    beforeEach(async()=> {
        user1 = await createLoggedAgent() 
        user2 = await createLoggedAgent({email: "alice@matchesGlob.com", firstname: "Alice", lastname: "Dupont"}) 
    })
    test("user1 check user2 profile",async ()=> {
        const res = await user1.agent.get(`/users/${user2.user.id}`)
        expect(res.status).toBe(200)
        expect(res.body.firstname).toBe("Alice")
        expect(res.body).not.toHaveProperty("email")        
    })
    test("Invalid Id",async ()=> {
        const res = await user1.agent.get(`/users/abc`)
        expect(res.status).toBe(400)
    })
    test("Unknown Id",async ()=> {
        const res = await user1.agent.get(`/users/999999`)
        expect(res.status).toBe(404)
    })
})

describe('PATCH /users/me', ()=> {
    let user1
    beforeEach(async()=> {
        user1 = await createLoggedAgent() 
    })
    test("Update firstname",async ()=> {
        const res = await user1.agent.patch(`/users/me`).send({firstname: 'Johnny'})
        expect(res.status).toBe(200)
        expect(res.body.firstname).toBe("Johnny")
        expect(res.body.lastname).toBe("Doe")
    })
    test("Empty field for Update firstname",async ()=> {
        const res = await user1.agent.patch(`/users/me`).send({firstname: ''})
        expect(res.status).toBe(400)
    })
    test("Attempt to pass ADMIN",async ()=> {
        const res = await user1.agent.patch(`/users/me`).send({role: 'ADMIN'})
        expect(res.status).toBe(200)
        expect(res.body.role).toBe("USER")
    })

})


describe('PATCH /users/me/password', ()=> {
    let user1
    beforeEach(async()=> {
        user1 = await createLoggedAgent()
    })

    test("Wrong current password", async ()=> {
        const res = await user1.agent.patch("/users/me/password").send({
            currentPassword: "wrong-password",
            newPassword: "newSecret12",
            confirmNewPassword: "newSecret12"
        })
        expect(res.status).toBe(403)
    })

    test("New passwords do not match", async ()=> {
        const res = await user1.agent.patch("/users/me/password").send({
            currentPassword: "secret12",
            newPassword: "newSecret12",
            confirmNewPassword: "other12345"
        })
        expect(res.status).toBe(400)
    })

    test("Change password, new cookie keeps the user logged in", async ()=> {
        const res = await user1.agent.patch("/users/me/password").send({
            currentPassword: "secret12",
            newPassword: "newSecret12",
            confirmNewPassword: "newSecret12"
        })
        expect(res.status).toBe(200)
        expect(res.body).not.toHaveProperty("password")
        expect(res.headers["set-cookie"][0]).toContain("token=")

        // Same agent: it now sends the new cookie
        const me = await user1.agent.get("/auth/me")
        expect(me.status).toBe(200)
    })

    test("Old token is rejected after a password change", async ()=> {
        // Keep the current cookie: "token=xxx" (the part before the first ";")
        const login = await request(app).post("/auth/login").send({email: "j.doe@prisma.com", password: "secret12"})
        const oldCookie = login.headers["set-cookie"][0].split(";")[0]

        // iat is in seconds: wait so the change happens in a later second
        await new Promise(r => setTimeout(r, 1100))

        await user1.agent.patch("/users/me/password").send({
            currentPassword: "secret12",
            newPassword: "newSecret12",
            confirmNewPassword: "newSecret12"
        })

        const res = await request(app).get("/auth/me").set("Cookie", oldCookie)
        expect(res.status).toBe(401)
        expect(res.body.error).toBe("Invalid or expired token")
    })

    test("Login works with the new password only", async ()=> {
        await user1.agent.patch("/users/me/password").send({
            currentPassword: "secret12",
            newPassword: "newSecret12",
            confirmNewPassword: "newSecret12"
        })
        const oldLogin = await request(app).post("/auth/login").send({email: "j.doe@prisma.com", password: "secret12"})
        expect(oldLogin.status).toBe(401)
        const newLogin = await request(app).post("/auth/login").send({email: "j.doe@prisma.com", password: "newSecret12"})
        expect(newLogin.status).toBe(200)
    })
})


describe('PATCH /users/me/email', ()=> {
    let user1
    let user2
    beforeEach(async()=> {
        user1 = await createLoggedAgent()
        user2 = await createLoggedAgent({email: "alice@test.com", firstname: "Alice", lastname: "Dupont"})
    })

    test("Change email", async ()=> {
        const res = await user1.agent.patch("/users/me/email").send({email: "john.new@test.com", currentPassword: "secret12"})
        expect(res.status).toBe(200)
        expect(res.body.email).toBe("john.new@test.com")

        // The new email works for login
        const login = await request(app).post("/auth/login").send({email: "john.new@test.com", password: "secret12"})
        expect(login.status).toBe(200)
    })

    test("Keep my own email", async ()=> {
        const res = await user1.agent.patch("/users/me/email").send({email: "j.doe@prisma.com", currentPassword: "secret12"})
        expect(res.status).toBe(200)
    })

    test("Email already used by someone else", async ()=> {
        const res = await user1.agent.patch("/users/me/email").send({email: "alice@test.com", currentPassword: "secret12"})
        expect(res.status).toBe(409)
        expect(res.body.error).toBe("Email already used")
    })

    test("Wrong current password", async ()=> {
        const res = await user1.agent.patch("/users/me/email").send({email: "john.new@test.com", currentPassword: "wrong-password"})
        expect(res.status).toBe(403)
    })

    test("Missing current password", async ()=> {
        const res = await user1.agent.patch("/users/me/email").send({email: "john.new@test.com"})
        expect(res.status).toBe(400)
    })
})


describe('PATCH /users/me/avatar', ()=> {
    let user1
    beforeEach(async()=> {
        user1 = await createLoggedAgent()
    })

    test("Upload an image", async ()=> {
        // .attach(field, content, options) sends multipart/form-data, like Postman's form-data
        const res = await user1.agent
            .patch("/users/me/avatar")
            .attach("image", Buffer.from("fake image"), {filename: "avatar.png", contentType: "image/png"})
        expect(res.status).toBe(200)
        expect(res.body.avatarUrl).toBe(FAKE_AVATAR_URL)
    })

    test("File type not allowed", async ()=> {
        const res = await user1.agent
            .patch("/users/me/avatar")
            .attach("image", Buffer.from("fake pdf"), {filename: "doc.pdf", contentType: "application/pdf"})
        expect(res.status).toBe(415)
    })

    test("File too large", async ()=> {
        const bigFile = Buffer.alloc(5 * 1024 * 1024 + 1) // 1 byte over the 5 MB limit
        const res = await user1.agent
            .patch("/users/me/avatar")
            .attach("image", bigFile, {filename: "big.png", contentType: "image/png"})
        expect(res.status).toBe(400)
    })

    test("Wrong field name", async ()=> {
        const res = await user1.agent
            .patch("/users/me/avatar")
            .attach("photo", Buffer.from("fake image"), {filename: "avatar.png", contentType: "image/png"})
        expect(res.status).toBe(400)
    })

    test("No file", async ()=> {
        const res = await user1.agent.patch("/users/me/avatar")
        expect(res.status).toBe(400)
        expect(res.body.error).toBe("No file to upload")
    })
})
