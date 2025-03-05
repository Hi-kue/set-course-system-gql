import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/admin.model.js";
import config from "../config/config.js";
import { logger } from "../config/logger.js";

dotenv.config();

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("MongoDB connected for admin creation"))
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });

const createInitialAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: "admin@my.centennialcollege.ca" });

    if (adminExists) {
      logger.info(`Admin already exists: ${adminExists.email}`);
      process.exit(0);
    }

    const admin = new Admin({
      username: "admin",
      email: "admin@my.centennialcollege.ca",
      password: "adminPassword123",
      firstName: "Admin",
      lastName: "User",
    });
    await admin.save();
    logger.info(`Admin Created Successfully: ${admin.email}`);

  } catch (error) {
    logger.error(`Admin Creation Failed: ${error.message}`);
    
  } finally {
    mongoose.disconnect();
    logger.info(`Disconnected from MongoDB.`);
  }
};

createInitialAdmin();
