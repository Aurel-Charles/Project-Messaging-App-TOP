import "dotenv/config";
import express from 'express'
import cors from "cors";

export const app = express()


app.use(cors({origin: process.env.CORS_ORIGINS.split(',')}))
app.use(express.json())

// Routes


app.get('/', (req,res)=> {
    res.json({App: process.env.APP_NAME, message : process.env.APP_MESSAGE})
})

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
    if (status >= 500) console.error(err);
    const message = status === 500 ? "Internal server error" : err.message;
    res.status(status).json({ error: message });
  });
