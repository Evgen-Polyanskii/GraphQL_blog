const { combineResolvers } = require('graphql-resolvers');
const validator = require('validator');
const { isAuthenticated } = require('../lib/secure.js');
const { isAllowedFormat } = require('../lib/utilities.js');
const storeUpload = require('../services/imageUpload.js');
const createAnalyticalReport = require('../services/queueSendEmail.js');

const resolvers = {
  Query: {
    getPostById: combineResolvers(
      isAuthenticated,
      async (_, { id }, { dataSources }) => {
        const options = { attributes: ['title', 'body', 'published_at'] };
        return dataSources.postAPI.findPostById(id, options);
      },
    ),
    getPostsList: combineResolvers(
      isAuthenticated,
      async (_, args, { dataSources }) => {
        const options = { attributes: ['title', 'body', 'published_at'], order: [['published_at', 'DESC']] };
        return dataSources.postAPI.getPostsWithPagination(args, options);
      },
    ),
    getUserComments: combineResolvers(
      isAuthenticated,
      async (_, args, { dataSources }) => {
        const options = { attributes: ['body', 'published_at'], order: [['published_at', 'DESC']] };
        return dataSources.commentAPI.getUserCommentsWithPagination(args, options);
      },
    ),
    getAnalyticalReport: combineResolvers(
      isAuthenticated,
      async (_, args) => {
        const { email, startDate, endDate } = args;
        if (!validator.isEmail(email)) throw new Error('Invalid email address.');
        if (!validator.isDate(startDate)) throw new Error('Invalid start date.');
        if (!validator.isDate(endDate)) throw new Error('Invalid end date.');
        createAnalyticalReport({ email, startDate, endDate });
        return {
          message: 'Report generation started',
        };
      },
    ),
  },

  Mutation: {
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
  },
};

module.exports = resolvers;
