const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs: scalarTypeDefs } = require('graphql-scalars');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const db = require('../db/models');
const { getUser } = require('./lib/secure.js');
const getRoutes = require('./routes/users.js');

const PostAPI = require('./src/datasources/PostAPI.js');
const UserAPI = require('./src/datasources/UserAPI.js');
const CommentAPI = require('./src/datasources/CommentAPI.js');

const typeDefs = require('./src/schema.js');
const resolvers = require('./src/resolvers.js');

const logger = morgan('combined');

const createServer = () => {
  const app = express();
  app.use(cors());
  app.use(logger);
  getRoutes(app);
  const httpServer = http.createServer(app);

  const dataSources = () => ({
    postAPI: new PostAPI(db),
    userAPI: new UserAPI(db),
    commentAPI: new CommentAPI(db),
  });

  const server = new ApolloServer({
    typeDefs: [scalarTypeDefs, typeDefs],
    resolvers,
    dataSources,
    context: getUser,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  return { app, httpServer, server };
};

module.exports = createServer;
