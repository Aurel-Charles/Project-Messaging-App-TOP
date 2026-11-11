import { Router } from "express";
import { isAuth } from "../middlewares/auth.js";
import { updateLastSeen } from "../middlewares/updateLastSeen.js";
import { handleValidation, validateFriendRequest, validateFriendRequestAnswer, validateFriendRequestsQuery } from "../middlewares/validators.js";
import { answerFriendRequest, getFriendRequests, sendFriendRequest } from "../controllers/friendsController.js";


export const friendRequestsRouter = Router()

friendRequestsRouter.use(isAuth, updateLastSeen)

friendRequestsRouter.post("/", validateFriendRequest, handleValidation , sendFriendRequest)
friendRequestsRouter.get("/", validateFriendRequestsQuery, handleValidation , getFriendRequests)
friendRequestsRouter.patch("/:id", validateFriendRequestAnswer, handleValidation , answerFriendRequest)