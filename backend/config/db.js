import mongoose from "mongoose"

const connectDB = async()=>{
    try{
        // Added options that sometimes resolve connection issues
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB connected successfully")
    }catch(error){
        console.log("MongoDB connection FAILED: ", error)
        process.exit(1) // Stop the app if DB connection fails
    }
}
export default connectDB