import mongoose from "mongoose";
import { DatabaseError } from "../errors/index.js"; // your custom error

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Wrap in custom DatabaseError
    throw new DatabaseError(
      `MongoDB connection failed: ${error.message}`
    );
  }
};

export default connectDB;
