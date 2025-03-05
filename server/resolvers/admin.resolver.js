import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import config from "../config/config.js";
import { AuthenticationError, UserInputError, ForbiddenError } from "apollo-server-express";

const generateAdminToken = (admin) => {
  const payload = {
    id: admin.id,
    email: admin.email,
    username: admin.username,
    isAdmin: true,
    role: "admin",
  };

  console.log("Generating admin token with payload:", payload);

  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
};

const adminResolvers = {
  Query: {
    admins: async (_, __, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new ForbiddenError("Not authorized to view admins");
      }
      return await Admin.find({});
    },
    admin: async (_, { id }, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new ForbiddenError("Not authorized to view admin details");
      }
      return await Admin.findById(id);
    },
    adminByEmail: async (_, { email }, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new ForbiddenError("Not authorized to search admins");
      }
      return await Admin.findOne({ email });
    },
    adminMe: async (_, __, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new AuthenticationError("Not authenticated as admin");
      }
      return await Admin.findById(context.user.id);
    },
  },
  Mutation: {
    adminLogin: async (_, { input }) => {
      const { email, password } = input;

      const admin = await Admin.findOne({ email });
      if (!admin) {
        throw new AuthenticationError("Invalid email or password");
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        throw new AuthenticationError("Invalid email or password");
      }

      const token = generateAdminToken(admin);

      return {
        token,
        admin,
      };
    },
    createAdmin: async (_, { input }, context) => {
      if (context.user && !context.user.isAdmin) {
        throw new ForbiddenError("Not authorized to create admin accounts");
      }

      const adminCount = await Admin.countDocuments();
      if (adminCount > 0 && !context.user) {
        throw new AuthenticationError("Authentication required to create admin accounts");
      }

      const existingAdmin = await Admin.findOne({ email: input.email });
      if (existingAdmin) {
        throw new UserInputError("Email already in use");
      }

      const existingUsername = await Admin.findOne({ username: input.username });
      if (existingUsername) {
        throw new UserInputError("Username already in use");
      }

      const admin = new Admin(input);
      await admin.save();

      return admin;
    },
    updateAdmin: async (_, { id, input }, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new ForbiddenError("Not authorized to update admin information");
      }

      if (input.password) {
        delete input.password;
      }

      const admin = await Admin.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true },
      );

      if (!admin) {
        throw new UserInputError("Admin not found");
      }

      return admin;
    },
    deleteAdmin: async (_, { id }, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new ForbiddenError("Not authorized to delete admin accounts");
      }

      const adminCount = await Admin.countDocuments();
      if (adminCount <= 1) {
        throw new UserInputError("Cannot delete the last admin account");
      }

      if (context.user.id === id) {
        throw new UserInputError("Cannot delete your own account");
      }

      const result = await Admin.findByIdAndDelete(id);

      if (!result) {
        throw new UserInputError("Admin not found");
      }

      return true;
    },
    changeAdminPassword: async (_, { currentPassword, newPassword }, context) => {
      if (!context.user || !context.user.isAdmin) {
        throw new AuthenticationError("Not authenticated as admin");
      }

      const admin = await Admin.findById(context.user.id);
      if (!admin) {
        throw new AuthenticationError("Admin not found");
      }

      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AuthenticationError("Current password is incorrect");
      }

      admin.password = newPassword;
      await admin.save();

      return true;
    },
  },
};

export default adminResolvers;