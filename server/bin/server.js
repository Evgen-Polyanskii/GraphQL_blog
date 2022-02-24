#! /usr/bin/env node

const { ApolloServer } = require('apollo-server');
const path = require('path');
const dotenv = require('dotenv');

const db = require('../../db/models');
const { isAuth } = require('../lib/secure.js');

const PostAPI = require('../src/datasources/PostAPI.js');
const UserAPI = require('../src/datasources/UserAPI.js');
const CommentAPI = require('../src/datasources/CommentAPI.js');

const typeDefs = require('../src/schema.js');
const resolvers = require('../src/resolvers.js');

const pathToEnv = path.resolve(__dirname, '../.env');

dotenv.config({ path: pathToEnv });

const port = process.env.PORT || 4000;
const host = process.env.HOST || 'localhost';

const dataSources = () => ({
  postAPI: new PostAPI(db),
  userAPI: new UserAPI(db),
  commentAPI: new CommentAPI(db),
});

const server = new ApolloServer({
  typeDefs,
  dataSources,
  resolvers,
  context: isAuth,
});

const startServer = async () => {
  await db.sequelize.sync();
  const { url } = await server.listen({ host, port });
  console.log(`🚀  Server ready at ${url}`);
};

startServer();

module.exports = dataSources;
