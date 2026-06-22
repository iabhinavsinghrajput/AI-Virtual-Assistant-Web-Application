import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
dotenv.config()
import connectDB from './config/db.js'
import authRouter from './routes/auth.routes.js'
import cors from "cors"
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.routes.js'
import geminiResponse from "./gemini.js"


const app = express()
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }
        // Allow the Render domain dynamically if needed, or fallback to true for same-origin
        return callback(null, true); // Simplified for deployment to avoid CORS blocking same-origin or Render domains
    },
    credentials: true
}))

const port = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
});

app.listen(port,()=>{
    connectDB()
    console.log("server started")
})