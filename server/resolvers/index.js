const studentResolvers = require('./student.resolver');
const courseResolvers = require('./course.resolver');

module.exports = [
  studentResolvers,
  courseResolvers
];