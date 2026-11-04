import { Router } from "express"
import { handleValidation, validateLogin, validateRegister } from "../middlewares/validators.js"
import { getMe, login, logout, register } from "../controllers/authController.js"
import { isAuth } from "../middlewares/auth.js"

export const authRouter = Router()


authRouter.post('/register',validateRegister, handleValidation, register)
authRouter.post('/login',validateLogin, handleValidation, login)
authRouter.get('/me',isAuth, getMe)
authRouter.post('/logout', logout)