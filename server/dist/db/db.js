import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        const mongoURL = process.env.MONGO_URL;
        await mongoose.connect(mongoURL);
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
};
