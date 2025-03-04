import { gql } from 'apollo-server-express';

const courseTypeDefs = gql`
  type Course {
    id: ID!
    courseCode: String!
    courseName: String!
    section: String!
    semester: String!
    students: [Student!]
    createdAt: String
    updatedAt: String
  }

  input CreateCourseInput {
    courseCode: String!
    courseName: String!
    section: String!
    semester: String!
  }

  input UpdateCourseInput {
    courseName: String
    section: String
    semester: String
  }

  extend type Query {
    courses: [Course!]!
    course(id: ID!): Course
    courseByCode(courseCode: String!): Course
    coursesByStudent(studentId: ID!): [Course!]!
  }

  extend type Mutation {
    createCourse(input: CreateCourseInput!): Course!
    updateCourse(id: ID!, input: UpdateCourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
  }
`;

export default courseTypeDefs;