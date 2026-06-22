import express from 'express'
import dotenv from 'dotenv'
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
        // Allow requests with no origin (like mobile apps, postman, or curl)
        if (!origin) return callback(null, true);
        
        // Define all allowed frontend URLs
        const allowedOrigins = [
            'https://ai-virtual-assistant-web-application-1.onrender.com', // Your production frontend
            'http://localhost:5173', // Typical Vite localhost port
            'http://localhost:3000', // Typical CRA localhost port
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ];

        // Check if the incoming request origin is in our allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // If it's not in the list, block it
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

const port = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)


app.listen(port,()=>{
    connectDB()
    console.log("server started")
})
