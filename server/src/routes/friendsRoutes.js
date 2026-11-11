import { Router } from "express";
import { isAuth } from "../middlewares/auth.js";
import { updateLastSeen } from "../middlewares/updateLastSeen.js";
import { getFriendsList, removeFriend } from "../controllers/friendsController.js";


export const friendsRouter = Router()

friendsRouter.use(isAuth, updateLastSeen)

friendsRouter.get('/', getFriendsList)
friendsRouter.delete('/:userId', removeFriend)
