const { combineResolvers } = require('graphql-resolvers');
const isAuthenticated = require('./authorization.js');
const { isAllowedFormat } = require('../lib/utilities.js');
const storeUpload = require('../services/imageUpload.js');

module.exports = {
  signup: async (_, args, { dataSources }) => dataSources.userAPI.createUser(args),
  login: async (_, args, { dataSources }) => dataSources.userAPI.loginUser(args),
  createPost: combineResolvers(
    isAuthenticated,
    async (_, args, { dataSources }) => dataSources.postAPI.createPost(args),
  ),
  createComment: combineResolvers(
    isAuthenticated,
    async (_, args, { dataSources }) => dataSources.commentAPI.createComment(args),
  ),
  singleUpload: combineResolvers(
    isAuthenticated,
    async (_, { file }, { dataSources }) => {
      const { stream, filename } = await file;
      if (!isAllowedFormat(filename)) throw new Error('Invalid file format.');
      const result = storeUpload(stream);
      if (result.success === false) throw new Error(result.message);
      await dataSources.userAPI.updateUser(result);
      return {
        message: result.message,
      };
    },
  ),
};
