import { describe, expect, test } from "vitest";
import  request  from "supertest";
import { app } from "../app";



describe("Server is runing", ()=> {
    test("index route works", async () => {
        const res = await request(app).get("/")    
        expect(res.status).toBe(200)
        expect(res.body.message).toEqual(process.env.APP_MESSAGE)
        expect(res.headers["content-type"]).toMatch((/json/))
    });
})