import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Student from "../models/student.model.js";
import Admin from "../models/admin.model.js";

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
    console.log('Decoded token:', decoded); // Debug token contents
    
    // Check explicitly for isAdmin flag
    if (decoded.isAdmin === true) {
      const admin = await Admin.findById(decoded.id);
      
      if (!admin) {
        console.log('Admin not found in database');
        return { user: null };
      }
      
      console.log('Authenticated as admin:', admin.email);
      return {
        user: {
          id: admin._id,
          email: admin.email,
          username: admin.username,
          isAdmin: true,
          role: 'admin' // Add role explicitly
        },
      };
    } else {
      const student = await Student.findById(decoded.id);

      if (!student) {
        console.log('Student not found in database');
        return { user: null };
      }

      console.log('Authenticated as student:', student.email);
      return {
        user: {
          id: student._id,
          email: student.email,
          studentNumber: student.studentNumber,
          isAdmin: false,
          role: 'student' // Add role explicitly
        },
      };
    }
  } catch (error) {
    console.error('Authentication error:', error.message);
    return { user: null };
  }
};

export default authMiddleware;