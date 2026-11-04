import { Router } from "express"
import { handleValidation, validateRegister } from "../middlewares/validators.js"
import { register } from "../controllers/authController.js"

export const authRouter = Router()


authRouter.post('/register',validateRegister, handleValidation, register)