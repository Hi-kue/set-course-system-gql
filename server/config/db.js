import mongoose from "mongoose";
import config from "./config.js";
import { logger } from "./logger.js";

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
    logger.info(
      `Mongo Database Server: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`,
    );
    return conn;
  } catch (error) {
    logger.error(`Error Connecting to Mongo Server: ${error.message}`);
    process.exit(1);
  }
};
