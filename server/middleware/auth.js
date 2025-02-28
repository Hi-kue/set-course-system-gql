const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Student = require('../models/student.model');

const authMiddleware = async (req) => {
  const authHeader = req.headers.authorization || '';
  
  if (!authHeader) {
    return { user: null };
  }

  // Check if the header has the format 'Bearer [token]'
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { user: null };
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Find the student in the database
    const student = await Student.findById(decoded.id);
    
    if (!student) {
      return { user: null };
    }
    
    // Return the user object to be used in context
    return { 
      user: {
        id: student._id,
        email: student.email,
        studentNumber: student.studentNumber
      } 
    };
  } catch (error) {
    // If token verification fails, return null user
    return { user: null };
  }
};

module.exports = authMiddleware;
