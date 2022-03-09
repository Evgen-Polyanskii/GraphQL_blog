const Query = require('./Query');
const Mutation = require('./Mutation');
const { GraphQLUpload } = require('graphql-upload');

module.exports = {
  Upload: GraphQLUpload,
  Query,
  Mutation,
};
