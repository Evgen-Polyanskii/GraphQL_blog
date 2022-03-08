const { combineResolvers } = require('graphql-resolvers');
const validator = require('validator');
const isAuthenticated = require('./authorization.js');
const createAnalyticalReport = require('../services/queueSendEmail.js');

module.exports = {
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
};
