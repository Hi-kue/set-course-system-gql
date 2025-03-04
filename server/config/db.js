import mongoose from "mongoose";
import config from "./config.js";

mongoose.set("strictQuery", true);

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, mongooseOptions);
    console.info(
      `Mongo database server: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`,
    );
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
