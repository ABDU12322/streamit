import mongoose from "mongoose";

const connectionString: string = "mongodb://localhost:27017/streamit";

let cachedConnection: typeof mongoose | null = null;

async function connectDB() {
    // If already connected, return cached connection
    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        const connection = await mongoose.connect(connectionString);
        cachedConnection = connection;
        console.log("Database connected successfully");
        return connection;
    } catch (error) {
        console.error("Database connection failed", error);
        throw error;
    }
}

export default connectDB;