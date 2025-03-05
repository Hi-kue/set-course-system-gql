import jwt from "jsonwebtoken";
import Student from "../models/student.model.js";
import Course from "../models/course.model.js";
import config from "../config/config.js";
import { AuthenticationError, UserInputError, ForbiddenError } from "apollo-server-express";

const generateToken = (student) => {
  return jwt.sign(
    { 
      id: student.id, 
      email: student.email, 
      studentNumber: student.studentNumber,
      isAdmin: false,
      role: 'student'
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN },
  );
};

const studentResolvers = {
  Query: {
    students: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to view students");
      }
      
      if (context.user.isAdmin) {
        return await Student.find().populate("courses");
      } else {
        return await Student.find({_id: context.user.id}).populate("courses");
      }
    },
    student: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to view student details");
      }
      
      if (!context.user.isAdmin && context.user.id !== id) {
        throw new ForbiddenError("You can only view your own student details");
      }
      
      return await Student.findById(id).populate("courses");
    },
    studentByEmail: async (_, { email }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to search students");
      }
      return await Student.findOne({ email }).populate("courses");
    },
    studentsByCourse: async (_, { courseId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to view students by course");
      }
      const course = await Course.findById(courseId).populate("students");
      return course ? course.students : [];
    },
    me: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in");
      }
      return await Student.findById(context.user.id).populate("courses");
    },
  },
  Mutation: {
    createStudent: async (_, { input }) => {
      const existingStudent = await Student.findOne({
        $or: [{ email: input.email }, { studentNumber: input.studentNumber }],
      });

      if (existingStudent) {
        throw new UserInputError("Student with this email or student number already exists");
      }

      const student = new Student(input);
      await student.save();

      const token = generateToken(student);

      return {
        token,
        student,
      };
    },
    updateStudent: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to update a student");
      }

      if (context.user.id !== id && !context.user.isAdmin) {
        throw new ForbiddenError("You can only update your own profile");
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true },
      ).populate("courses");

      if (!updatedStudent) {
        throw new UserInputError("Student not found");
      }

      return updatedStudent;
    },
    deleteStudent: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to delete a student");
      }

      if (context.user.id !== id && !context.user.isAdmin) {
        throw new ForbiddenError("You can only delete your own profile");
      }

      const result = await Student.findByIdAndDelete(id);

      if (!result) {
        throw new UserInputError("Student not found");
      }

      await Course.updateMany({ students: id }, { $pull: { students: id } });

      return true;
    },
    addCourseToStudent: async (_, { studentId, courseId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to add a course");
      }

      if (context.user.id !== studentId && !context.user.isAdmin) {
        throw new ForbiddenError("You can only modify your own courses");
      }

      const student = await Student.findById(studentId);
      if (!student) {
        throw new UserInputError("Student not found");
      }

      const course = await Course.findById(courseId);
      if (!course) {
        throw new UserInputError("Course not found");
      }

      if (student.courses.includes(courseId)) {
        throw new UserInputError("Student is already registered for this course");
      }

      student.courses.push(courseId);
      await student.save();

      course.students.push(studentId);
      await course.save();

      return await Student.findById(studentId).populate("courses");
    },
    removeCourseFromStudent: async (_, { studentId, courseId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to remove a course");
      }

      if (context.user.id !== studentId && !context.user.isAdmin) {
        throw new ForbiddenError("You can only modify your own courses");
      }

      const student = await Student.findById(studentId);
      if (!student) {
        throw new UserInputError("Student not found");
      }

      const course = await Course.findById(courseId);
      if (!course) {
        throw new UserInputError("Course not found");
      }

      if (!student.courses.includes(courseId)) {
        throw new UserInputError("Student is not registered for this course");
      }

      student.courses = student.courses.filter((courseId) => courseId.toString() !== courseId);
      await student.save();

      course.students = course.students.filter((student) => student.toString() !== studentId);
      await course.save();

      return await Student.findById(studentId).populate("courses");
    },
    login: async (_, { input }) => {
      const { email, password } = input;

      const student = await Student.findOne({ email });
      if (!student) {
        throw new AuthenticationError("Invalid email or password");
      }

      const isMatch = await student.comparePassword(password);
      if (!isMatch) {
        throw new AuthenticationError("Invalid email or password");
      }

      const token = generateToken(student);

      return {
        token,
        student,
      };
    },
    changePassword: async (_, { currentPassword, newPassword }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to change your password");
      }

      const student = await Student.findById(context.user.id);
      if (!student) {
        throw new UserInputError("Student not found");
      }

      const isMatch = await student.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AuthenticationError("Current password is incorrect");
      }

      student.password = newPassword;
      await student.save();

      return true;
    },
  },
  Student: {
    courses: async (parent) => {
      if (parent.courses) {
        if (parent.courses[0] && typeof parent.courses[0] === "object") {
          return parent.courses;
        }
        return await Course.find({ _id: { $in: parent.courses } });
      }
      return [];
    },
  },
};

export default studentResolvers;