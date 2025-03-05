import Course from "../models/course.model.js";
import Student from "../models/student.model.js";
import { AuthenticationError, UserInputError } from "apollo-server-express";

const courseResolvers = {
  Query: {
    // Query: Get all courses.
    courses: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to view courses");
      }
      return await Course.find().populate("students");
    },

    // Query: Get a single course by Id.
    course: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to view course details");
      }
      return await Course.findById(id).populate("students");
    },

    // Query: Get course by courseCode.
    courseByCode: async (_, { courseCode }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to search courses");
      }
      return await Course.findOne({ courseCode }).populate("students");
    },

    // Query: Get course by studentId.
    coursesByStudent: async (_, { studentId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to view courses by student");
      }
      const student = await Student.findById(studentId).populate("courses");
      return student ? student.courses : [];
    },
  },

  Mutation: {
    // Mutation: Create a course with payload data.
    createCourse: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to create a course");
      }

      // Check if user is admin
      if (!context.user.isAdmin) {
        throw new AuthenticationError("Only admins can create courses");
      }

      // Check: If course with the same code already exists, throw an error.
      const existingCourse = await Course.findOne({ courseCode: input.courseCode });
      if (existingCourse) {
        throw new UserInputError("Course with this code already exists");
      }

      const course = new Course({
        ...input,
        students: [],
      });
      await course.save();

      return course;
    },

    // Mutation: Update a course with payload data.
    updateCourse: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to update a course");
      }

      // Check if user is admin
      if (!context.user.isAdmin) {
        throw new AuthenticationError("Only admins can update courses");
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true },
      ).populate("students");

      if (!updatedCourse) {
        throw new UserInputError("Course not found");
      }

      return updatedCourse;
    },

    // Mutation: Delete a course by its Id.
    deleteCourse: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to delete a course");
      }

      // Check if user is admin
      if (!context.user.isAdmin) {
        throw new AuthenticationError("Only admins can delete courses");
      }

      const result = await Course.findByIdAndDelete(id);

      if (!result) {
        throw new UserInputError("Course not found");
      }

      // Check: Remove all courses from students if course is deleted.
      await Student.updateMany({ courses: id }, { $pull: { courses: id } });

      return true;
    },
  },

  Course: {
    students: async (parent) => {
      if (parent.students) {
        if (parent.students[0] && typeof parent.students[0] === "object") {
          return parent.students;
        }
        return await Student.find({ _id: { $in: parent.students } });
      }
      return [];
    },
  },
};

export default courseResolvers;
