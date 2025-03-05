import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Student from "../models/student.model.js";
import Admin from "../models/admin.model.js";
import { logger } from "../config/logger.js";

const authMiddleware = async (req) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader) {
    return { user: null };
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return { user: null };
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (decoded.isAdmin === true) {
      const admin = await Admin.findById(decoded.id);

      if (!admin) {
        logger.error("Admin Not Found Within Database.");
        return { user: null };
      }

      logger.info("Successfully Authenticated as Admin.");
      return {
        user: {
          id: admin._id,
          email: admin.email,
          username: admin.username,
          isAdmin: true,
          role: "admin",
        },
      };
    } else {
      const student = await Student.findById(decoded.id);

      if (!student) {
        logger.error("Student Not Found Within Database.");
        return { user: null };
      }

      logger.info("Successfully Authenticated as Student.");
      return {
        user: {
          id: student._id,
          email: student.email,
          studentNumber: student.studentNumber,
          isAdmin: false,
          role: "student",
        },
      };
    }
  } catch (error) {
    logger.error("Authentication error:", error.message);
    return { user: null };
  }
};

export default authMiddleware;
