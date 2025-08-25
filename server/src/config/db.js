import { MONGODB_URI } from "./env.js";
import mongoose from "mongoose";

let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
    });

    cachedDb = mongoose.connection;

    cachedDb.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      cachedDb = null;
    });

    cachedDb.on("disconnected", () => {
      console.log("MongoDB disconnected");
      cachedDb = null;
    });

    return cachedDb;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
