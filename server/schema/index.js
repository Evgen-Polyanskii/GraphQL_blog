const { mergeTypeDefs } = require('@graphql-tools/merge');
const { buildSchema, print } = require('graphql');
const userSchema = require('./user.js');
const postSchema = require('./post.js');
const commentSchema = require('./comment.js');

const linkSchema = `
  scalar Date
  
  type reportMessage {
    message: String!
  }
  
  type Query {
    getAnalyticalReport(startDate: Date!, endDate: Date!, email: String!): reportMessage
  }
`;

const schema = mergeTypeDefs([linkSchema, userSchema, postSchema, commentSchema]);

module.exports = buildSchema(print(schema));
