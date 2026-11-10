import "dotenv/config";
import express from 'express'
import cors from "cors";
import cookieParser from "cookie-parser"
import { authRouter } from "./routes/authRoutes.js";
import { usersRouter } from "./routes/usersRoutes.js";
import multer from "multer";
import { friendRequestsRouter } from "./routes/friendRequestsRoutes.js";

export const app = express()


app.use(cors({
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
// Routes
app.use("/auth", authRouter)
app.use("/users", usersRouter)
app.use("/friend-requests", friendRequestsRouter)

app.get('/', (req,res)=> {
    res.json({App: process.env.APP_NAME, message : process.env.APP_MESSAGE})
})

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  const status = err.statusCode || 500;
    if (status >= 500) console.error(err);
    const message = status === 500 ? "Internal server error" : err.message;
    res.status(status).json({ error: message });
  });
