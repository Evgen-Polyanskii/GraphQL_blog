const { GraphQLUpload } = require('graphql-upload');
const Query = require('./Query');
const Mutation = require('./Mutation');

module.exports = {
  Upload: GraphQLUpload,
  Query,
  Mutation,
};
