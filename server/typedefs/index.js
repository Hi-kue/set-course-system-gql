const { gql } = require('apollo-server-express');
const studentTypeDefs = require('./student.typedef');
const courseTypeDefs = require('./course.typedef');

// NOTE: Base type definitions.
const baseTypeDefs = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

module.exports = [
  baseTypeDefs,
  studentTypeDefs,
  courseTypeDefs
];
