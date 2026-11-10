import { Router } from "express";
import { isAuth } from "../middlewares/auth.js";
import { updateLastSeen } from "../middlewares/updateLastSeen.js";
import { handleValidation, validateFriendRequest } from "../middlewares/validators.js";
import { sendFriendRequest } from "../controllers/friendsController.js";


export const friendRequestsRouter = Router()

friendRequestsRouter.use(isAuth, updateLastSeen)

friendRequestsRouter.post("/", validateFriendRequest, handleValidation , sendFriendRequest)