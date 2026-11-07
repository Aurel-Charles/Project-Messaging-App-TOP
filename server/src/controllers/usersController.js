import { getAllUsers, getPublicUserById, getUserByEmail, updateUserById } from "../db/queries/userQueries.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import { createToken } from "../utils/createToken.js";
import { HttpError } from "../utils/httpErrorHandler.js";
import { isOnline } from "../utils/isOnline.js";
import { createPassword } from "../utils/managePassword.js";
import { parseIdParam } from "../utils/parseIdParam.js";
import { uploadImage } from "../utils/uploadImage.js";

export async function getUsers(req, res) {
    const data = await getAllUsers()
    const users = data.map((u) => ({...u, isOnline : isOnline(u.lastSeenAt)}))
    res.json(users)
}

export async function getUser(req, res) {
    const id = parseIdParam(req.params.id)
    const data = await getPublicUserById(id)
    if (data === null) throw new HttpError("User not found", 404) 
    const user = {...data, isOnline : isOnline(data.lastSeenAt)}
    res.json(user)
}

export async function updateMe(req, res) {
    const id = req.user.id
    const data = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
    }
    const updatedUser = await updateUserById(id, data)
    res.json(updatedUser)
}

export async function updatePassword(req, res) {
    const id = req.user.id
    const newPassword = req.body.newPassword
    const hashNewPassword = await createPassword(newPassword)
    const data = {
        password : hashNewPassword,
        passwordChangedAt : new Date()
    }
    const updatedUser =  await updateUserById(id, data)
    const token = createToken(updatedUser)
    res.cookie("token", token, cookieOptions)
    res.json(updatedUser)
}

export async function updateEmail(req, res) {
    const email = req.body.email
    const id = req.user.id
    const existingUser = await getUserByEmail(email)
    if (existingUser && id !== existingUser.id) {
        throw new HttpError("Email already used", 409);
    }
    const data = {email : email}
    const updatedUser = await updateUserById(id, data)
    res.json(updatedUser)
}

export async function updateAvatar(req, res) {
    if (!req.file) {
        throw new HttpError('No file to upload', 400)
    }
    const url = await uploadImage(req.file, "avatars")

    const id = req.user.id
    const data = {avatarUrl : url}
    const updatedUser = await updateUserById(id, data)
    res.json(updatedUser)
}
