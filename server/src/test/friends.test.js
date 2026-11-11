import { afterAll, beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import { app } from "../app";
import { prisma } from "../db/prisma";
import { createLoggedAgent, resetDb } from "./helper.js";


// Three users for every test: John (default), Alice and Bob.
// Each one is { agent, user }: agent keeps the login cookie, user holds the id.
let john
let alice
let bob

beforeEach(async () => {
    await resetDb()
    john = await createLoggedAgent()
    alice = await createLoggedAgent({ email: "alice@test.com", firstname: "Alice", lastname: "Martin" })
    bob = await createLoggedAgent({ email: "bob@test.com", firstname: "Bob", lastname: "Durand" })
})
afterAll(async () => {
    await prisma.$disconnect()
})

// Small shortcuts to keep the tests readable
function sendRequest(from, to) {
    return from.agent.post("/friend-requests").send({ receiverId: to.user.id })
}
function answer(as, requestId, status) {
    return as.agent.patch(`/friend-requests/${requestId}`).send({ status })
}
async function makeFriends(a, b) {
    const sent = await sendRequest(a, b)
    await answer(b, sent.body.id, "ACCEPTED")
}


describe("POST /friend-requests", () => {
    test("Send a request", async () => {
        const res = await sendRequest(john, alice)
        expect(res.status).toBe(201)
        expect(res.body.requesterId).toBe(john.user.id)
        expect(res.body.receiverId).toBe(alice.user.id)
        expect(res.body.status).toBe("PENDING")
    })

    test("Cannot add yourself", async () => {
        const res = await sendRequest(john, john)
        expect(res.status).toBe(400)
        expect(res.body.error).toBe("You cannot add yourself")
    })

    test("Unknown receiver", async () => {
        const res = await john.agent.post("/friend-requests").send({ receiverId: 999999 })
        expect(res.status).toBe(404)
    })

    test("Invalid receiverId", async () => {
        const res = await john.agent.post("/friend-requests").send({ receiverId: "abc" })
        expect(res.status).toBe(400)
    })

    test("Same request twice", async () => {
        await sendRequest(john, alice)
        const res = await sendRequest(john, alice)
        expect(res.status).toBe(409)
    })

    test("Request in the other direction is blocked too", async () => {
        await sendRequest(john, alice)
        const res = await sendRequest(alice, john)
        expect(res.status).toBe(409)
    })

    test("Already friends", async () => {
        await makeFriends(john, alice)
        const res = await sendRequest(john, alice)
        expect(res.status).toBe(409)
    })

    test("A declined request can be sent again, in both directions", async () => {
        const first = await sendRequest(john, alice)
        await answer(alice, first.body.id, "DECLINED")

        // Alice changes her mind and asks John herself
        const res = await sendRequest(alice, john)
        expect(res.status).toBe(201)
        expect(res.body.requesterId).toBe(alice.user.id)

        // The old DECLINED line was replaced: only one line left between them
        const count = await prisma.friendship.count()
        expect(count).toBe(1)
    })

    test("Without cookie", async () => {
        const res = await request(app).post("/friend-requests").send({ receiverId: alice.user.id })
        expect(res.status).toBe(401)
    })
})


describe("GET /friend-requests", () => {
    beforeEach(async () => {
        await sendRequest(john, alice)
        await sendRequest(bob, alice)
    })

    test("Received requests, with the requester's public fields", async () => {
        const res = await alice.agent.get("/friend-requests")
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
        for (const r of res.body) {
            expect(r.requester).toBeDefined()
            expect(r.requester).not.toHaveProperty("email")
            expect(r.requester).not.toHaveProperty("password")
        }
    })

    test("Most recent first", async () => {
        // Both requests may be created in the same millisecond: make John's clearly older
        await prisma.friendship.updateMany({
            where: { requesterId: john.user.id },
            data: { createdAt: new Date("2020-01-01") }
        })
        const res = await alice.agent.get("/friend-requests")
        expect(res.body[0].requester.firstname).toBe("Bob")
    })

    test("?type=received gives the same result as no type", async () => {
        const res = await alice.agent.get("/friend-requests?type=received")
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
    })

    test("?type=sent shows the receiver", async () => {
        const res = await john.agent.get("/friend-requests?type=sent")
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(1)
        expect(res.body[0].receiver.firstname).toBe("Alice")
    })

    test("Answered requests are not listed anymore", async () => {
        const received = await alice.agent.get("/friend-requests")
        await answer(alice, received.body[0].id, "ACCEPTED")
        const res = await alice.agent.get("/friend-requests")
        expect(res.body).toHaveLength(1)
    })

    test("Invalid type", async () => {
        const res = await alice.agent.get("/friend-requests?type=abc")
        expect(res.status).toBe(400)
    })
})


describe("PATCH /friend-requests/:id", () => {
    let requestId
    beforeEach(async () => {
        const sent = await sendRequest(john, alice)
        requestId = sent.body.id
    })

    test("Receiver accepts", async () => {
        const res = await answer(alice, requestId, "ACCEPTED")
        expect(res.status).toBe(200)
        expect(res.body.status).toBe("ACCEPTED")
    })

    test("Receiver declines", async () => {
        const res = await answer(alice, requestId, "DECLINED")
        expect(res.status).toBe(200)
        expect(res.body.status).toBe("DECLINED")
    })

    test("Requester cannot answer his own request", async () => {
        const res = await answer(john, requestId, "ACCEPTED")
        expect(res.status).toBe(403)
    })

    test("A third person cannot answer", async () => {
        const res = await answer(bob, requestId, "ACCEPTED")
        expect(res.status).toBe(403)
    })

    test("Already answered", async () => {
        await answer(alice, requestId, "ACCEPTED")
        const res = await answer(alice, requestId, "DECLINED")
        expect(res.status).toBe(409)
    })

    test("Invalid status", async () => {
        const res = await answer(alice, requestId, "MAYBE")
        expect(res.status).toBe(400)
    })

    test("Unknown request", async () => {
        const res = await answer(alice, 999999, "ACCEPTED")
        expect(res.status).toBe(404)
    })

    test("Invalid id", async () => {
        const res = await alice.agent.patch("/friend-requests/abc").send({ status: "ACCEPTED" })
        expect(res.status).toBe(400)
    })
})


describe("GET /friends", () => {
    test("Friends on both sides of the request", async () => {
        await makeFriends(john, alice)  // John sent the request
        await makeFriends(bob, john)    // John received the request

        const res = await john.agent.get("/friends")
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)

        // The list holds the OTHER person, never John himself
        const names = res.body.map((f) => f.firstname).sort()
        expect(names).toEqual(["Alice", "Bob"])
    })

    test("Public fields only, with isOnline", async () => {
        await makeFriends(john, alice)
        const res = await john.agent.get("/friends")
        const friend = res.body[0]
        expect(friend).not.toHaveProperty("email")
        expect(friend).not.toHaveProperty("password")
        expect(typeof friend.isOnline).toBe("boolean")
    })

    test("isOnline is computed for the friend, not for me", async () => {
        // Bob sends, John accepts: for John, the friend is on the "requester" side
        await makeFriends(bob, john)
        // Bob was last seen long ago
        await prisma.user.update({ where: { id: bob.user.id }, data: { lastSeenAt: new Date("2020-01-01") } })

        const res = await john.agent.get("/friends")
        expect(res.body[0].firstname).toBe("Bob")
        expect(res.body[0].isOnline).toBe(false)
    })

    test("Pending requests are not friends", async () => {
        await sendRequest(john, alice)
        const res = await john.agent.get("/friends")
        expect(res.body).toHaveLength(0)
    })
})


describe("DELETE /friends/:userId", () => {
    test("Remove a friend", async () => {
        await makeFriends(john, alice)
        const res = await john.agent.delete(`/friends/${alice.user.id}`)
        expect(res.status).toBe(204)

        const list = await john.agent.get("/friends")
        expect(list.body).toHaveLength(0)
    })

    test("The other person can remove too", async () => {
        await makeFriends(john, alice)
        const res = await alice.agent.delete(`/friends/${john.user.id}`)
        expect(res.status).toBe(204)
    })

    test("Remove twice", async () => {
        await makeFriends(john, alice)
        await john.agent.delete(`/friends/${alice.user.id}`)
        const res = await john.agent.delete(`/friends/${alice.user.id}`)
        expect(res.status).toBe(404)
    })

    test("A pending request is not a friend", async () => {
        await sendRequest(john, alice)
        const res = await john.agent.delete(`/friends/${alice.user.id}`)
        expect(res.status).toBe(404)
    })

    test("Invalid id", async () => {
        const res = await john.agent.delete("/friends/abc")
        expect(res.status).toBe(400)
    })
})
