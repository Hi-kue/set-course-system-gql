import { gql } from "apollo-server-express";

const studentTypeDefs = gql`
  type Student {
    id: ID!
    studentNumber: String!
    firstName: String!
    lastName: String!
    address: String
    city: String
    phoneNumber: String
    email: String!
    program: String!
    courses: [Course!]
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    student: Student!
  }

  input CreateStudentInput {
    studentNumber: String!
    password: String!
    firstName: String!
    lastName: String!
    address: String
    city: String
    phoneNumber: String
    email: String!
    program: String!
  }

  input UpdateStudentInput {
    firstName: String
    lastName: String
    address: String
    city: String
    phoneNumber: String
    program: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    students: [Student!]!
    student(id: ID!): Student
    studentByEmail(email: String!): Student
    studentsByCourse(courseId: ID!): [Student!]!
    me: Student
  }

  extend type Mutation {
    createStudent(input: CreateStudentInput!): AuthPayload!
    updateStudent(id: ID!, input: UpdateStudentInput!): Student!
    deleteStudent(id: ID!): Boolean!
    addCourseToStudent(studentId: ID!, courseId: ID!): Student!
    removeCourseFromStudent(studentId: ID!, courseId: ID!): Student!
    login(input: LoginInput!): AuthPayload!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
  }
`;

export default studentTypeDefs;
