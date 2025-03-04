import { gql } from "apollo-server-express";
import studentTypeDefsModule from "./student.typedef.js";
import courseTypeDefsModule from "./course.typedef.js";

export const studentTypeDefs = studentTypeDefsModule;
export const courseTypeDefs = courseTypeDefsModule;

// NOTE: Base type definitions.
export const baseTypeDefs = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;
