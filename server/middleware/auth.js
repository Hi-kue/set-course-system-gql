import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Student from "../models/student.model.js";

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
    const student = await Student.findById(decoded.id);

    if (!student) {
      return { user: null };
    }

    return {
      user: {
        id: student._id,
        email: student.email,
        studentNumber: student.studentNumber,
      },
    };
  } catch (error) {
    return { user: null };
  }
};

export default authMiddleware;
