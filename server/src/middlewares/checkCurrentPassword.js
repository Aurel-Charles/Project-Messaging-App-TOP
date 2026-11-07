import { getUserWithPasswordById } from "../db/queries/userQueries.js";
import { HttpError } from "../utils/httpErrorHandler.js";
import { verifyPassword } from "../utils/managePassword.js";

export async function checkCurrentPassword(req, res, next ) {
    const currentPassword = req.body.currentPassword
    const user = await getUserWithPasswordById(req.user.id)
    const password = user.password
    const isMatch = await verifyPassword(currentPassword, password)
    if (!isMatch) {
        throw new HttpError("Current password is incorrect", 403);
    }
    next()
}