import { getUserById } from "../db/queries/userQueries.js";
import { HttpError } from "../utils/httpErrorHandler.js"
import jwt from "jsonwebtoken";

async function isTokenValid(payload) {
    const user = await getUserById(payload.id)
    
    if (!user) return false
    
    const passwordChangedAt = Math.floor(user.passwordChangedAt.getTime() / 1000)
    if (payload.iat < passwordChangedAt) {
        return false
    }
    return true
}

export async function isAuth(req,res, next) {
    const token = req.cookies.token

    if (!token){
        throw new HttpError("Login required", 401)
    }

    let payload
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        throw new HttpError("Invalid or expired token", 401);
    }
    if ( !await isTokenValid(payload)) {
        throw new HttpError("Invalid or expired token", 401);
    }
    req.user = payload
    next()
}