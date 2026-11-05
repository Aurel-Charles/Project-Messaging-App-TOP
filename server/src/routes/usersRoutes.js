import { Router } from "express";
import { getUser, getUsers } from "../controllers/usersController.js";
import { isAuth } from "../middlewares/auth.js";
import { updateLastSeen } from "../middlewares/updateLastSeen.js";

export const usersRouter = Router()

usersRouter.use(isAuth, updateLastSeen)

usersRouter.get('/', getUsers)
usersRouter.get('/:id', getUser)