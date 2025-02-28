const jwt = require('jsonwebtoken');
const Student = require('../models/student.model');
const Course = require('../models/course.model');
const config = require('../config/config');
const { AuthenticationError, UserInputError, ForbiddenError } = require('apollo-server-express');

// Generate JWT token
const generateToken = (student) => {
  return jwt.sign(
    { id: student.id, email: student.email, studentNumber: student.studentNumber },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

const studentResolvers = {
  Query: {
    students: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to view students');
      }
      return await Student.find().populate('courses');
    },
    student: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to view student details');
      }
      return await Student.findById(id).populate('courses');
    },
    studentByEmail: async (_, { email }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to search students');
      }
      return await Student.findOne({ email }).populate('courses');
    },
    studentsByCourse: async (_, { courseId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to view students by course');
      }
      const course = await Course.findById(courseId).populate('students');
      return course ? course.students : [];
    },
    me: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await Student.findById(context.user.id).populate('courses');
    }
  },
  Mutation: {
    createStudent: async (_, { input }) => {
      // Check if student with email or student number already exists
      const existingStudent = await Student.findOne({
        $or: [
          { email: input.email },
          { studentNumber: input.studentNumber }
        ]
      });

      if (existingStudent) {
        throw new UserInputError('Student with this email or student number already exists');
      }

      const student = new Student(input);
      await student.save();

      const token = generateToken(student);

      return {
        token,
        student
      };
    },
    updateStudent: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to update a student');
      }

      // Only allow students to update their own profile or admins
      if (context.user.id !== id && !context.user.isAdmin) {
        throw new ForbiddenError('You can only update your own profile');
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      ).populate('courses');

      if (!updatedStudent) {
        throw new UserInputError('Student not found');
      }

      return updatedStudent;
    },
    deleteStudent: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a student');
      }

      // Only allow students to delete their own profile or admins
      if (context.user.id !== id && !context.user.isAdmin) {
        throw new ForbiddenError('You can only delete your own profile');
      }

      const result = await Student.findByIdAndDelete(id);
      
      if (!result) {
        throw new UserInputError('Student not found');
      }

      // Remove student from all courses
      await Course.updateMany(
        { students: id },
        { $pull: { students: id } }
      );

      return true;
    },
    addCourseToStudent: async (_, { studentId, courseId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to add a course');
      }

      // Only allow students to modify their own courses or admins
      if (context.user.id !== studentId && !context.user.isAdmin) {
        throw new ForbiddenError('You can only modify your own courses');
      }

      const student = await Student.findById(studentId);
      if (!student) {
        throw new UserInputError('Student not found');
      }

      const course = await Course.findById(courseId);
      if (!course) {
        throw new UserInputError('Course not found');
      }

      // Check if student is already registered for the course
      if (student.courses.includes(courseId)) {
        throw new UserInputError('Student is already registered for this course');
      }

      // Add course to student
      student.courses.push(courseId);
      await student.save();

      // Add student to course
      course.students.push(studentId);
      await course.save();

      return await Student.findById(studentId).populate('courses');
    },
    removeCourseFromStudent: async (_, { studentId, courseId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to remove a course');
      }

      // Only allow students to modify their own courses or admins
      if (context.user.id !== studentId && !context.user.isAdmin) {
        throw new ForbiddenError('You can only modify your own courses');
      }

      const student = await Student.findById(studentId);
      if (!student) {
        throw new UserInputError('Student not found');
      }

      const course = await Course.findById(courseId);
      if (!course) {
        throw new UserInputError('Course not found');
      }

      // Check if student is registered for the course
      if (!student.courses.includes(courseId)) {
        throw new UserInputError('Student is not registered for this course');
      }

      // Remove course from student
      student.courses = student.courses.filter(
        courseId => courseId.toString() !== courseId
      );
      await student.save();

      // Remove student from course
      course.students = course.students.filter(
        student => student.toString() !== studentId
      );
      await course.save();

      return await Student.findById(studentId).populate('courses');
    },
    login: async (_, { input }) => {
      const { email, password } = input;

      // Find student by email
      const student = await Student.findOne({ email });
      if (!student) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check password
      const isMatch = await student.comparePassword(password);
      if (!isMatch) {
        throw new AuthenticationError('Invalid email or password');
      }

      const token = generateToken(student);

      return {
        token,
        student
      };
    },
    changePassword: async (_, { currentPassword, newPassword }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to change your password');
      }

      const student = await Student.findById(context.user.id);
      if (!student) {
        throw new UserInputError('Student not found');
      }

      // Verify current password
      const isMatch = await student.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Update password
      student.password = newPassword;
      await student.save();

      return true;
    }
  },
  Student: {
    courses: async (parent) => {
      if (parent.courses) {
        if (parent.courses[0] && typeof parent.courses[0] === 'object') {
          return parent.courses;
        }
        return await Course.find({ _id: { $in: parent.courses } });
      }
      return [];
    }
  }
};

module.exports = studentResolvers;
