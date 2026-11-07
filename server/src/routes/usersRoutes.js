import { Router } from "express";
import { getUser, getUsers, updateAvatar, updateEmail, updateMe, updatePassword } from "../controllers/usersController.js";
import { isAuth } from "../middlewares/auth.js";
import { updateLastSeen } from "../middlewares/updateLastSeen.js";
import { handleValidation, validateUpdateEmail, validateUpdateMe, validateUpdatePassword } from "../middlewares/validators.js";
import { checkCurrentPassword } from "../middlewares/checkCurrentPassword.js";
import { upload } from "../middlewares/upload.js";

export const usersRouter = Router()

usersRouter.use(isAuth, updateLastSeen)

// GET
usersRouter.get('/', getUsers)
usersRouter.get('/:id', getUser)

// PATCH
usersRouter.patch('/me',validateUpdateMe, handleValidation, updateMe)
usersRouter.patch('/me/password',validateUpdatePassword, handleValidation, checkCurrentPassword , updatePassword)
usersRouter.patch('/me/email',validateUpdateEmail, handleValidation, checkCurrentPassword , updateEmail)
usersRouter.patch('/me/avatar', upload.single('image'), updateAvatar)