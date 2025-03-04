import { gql } from "apollo-server-express";

const adminTypeDefs = gql`
  type Admin {
    id: ID!
    username: String!
    email: String!
    firstName: String!
    lastName: String!
    createdAt: String
    updatedAt: String
  }

  type AdminAuthPayload {
    token: String!
    admin: Admin!
  }

  input AdminLoginInput {
    email: String!
    password: String!
  }

  input AdminCreateInput {
    username: String!
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input AdminUpdateInput {
    username: String
    email: String
    firstName: String
    lastName: String
    password: String
  }

  extend type Query {
    admins: [Admin!]!
    admin(id: ID!): Admin
    adminByEmail(email: String!): Admin
    adminMe: Admin
  }

  extend type Mutation {
    adminLogin(input: AdminLoginInput!): AdminAuthPayload!
    createAdmin(input: AdminCreateInput!): Admin!
    updateAdmin(id: ID!, input: AdminUpdateInput!): Admin!
    deleteAdmin(id: ID!): Boolean!
    changeAdminPassword(currentPassword: String!, newPassword: String!): Boolean!
  }
`;

export default adminTypeDefs;