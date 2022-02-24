const resolvers = {
  Query: {
    getPostById: async (_, { id }, { user, dataSources }) => {
      if (!user) throw new Error('You must be logged in.');
      const options = { attributes: ['title', 'body', 'published_at'] };
      return dataSources.postAPI.findPostById(id, options);
    },
    getPostsList: async (_, args, { user, dataSources }) => {
      if (!user) throw new Error('You must be logged in.');
      const options = { attributes: ['title', 'body', 'published_at'], order: [['published_at', 'DESC']] };
      return dataSources.postAPI.getPostsWithPagination(args, options);
    },
    getUserComments: async (_, args, { user, dataSources }) => {
      if (!user && user.userId !== args.userId) throw new Error('Access denied!');
      const options = { attributes: ['body', 'published_at'], order: [['published_at', 'DESC']] };
      return dataSources.commentAPI.getUserCommentsWithPagination(args, options);
    },
  },

  Mutation: {
    signup: async (_, args, { dataSources }) => dataSources.userAPI.createUser(args),
    login: async (_, args, { dataSources }) => dataSources.userAPI.loginUser(args),
    createPost: async (_, args, { user, dataSources }) => {
      if (!user) throw new Error('You must be logged in.');
      return dataSources.postAPI.createPost(args);
    },
    createComment: async (_, args, { user, dataSources }) => {
      if (!user) throw new Error('You must be logged in.');
      return dataSources.commentAPI.createComment(args);
    },

  },
};

module.exports = resolvers;
