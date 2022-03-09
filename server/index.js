const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const { typeDefs: scalarTypeDefs } = require('graphql-scalars');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const db = require('../db/models');
const { getUser } = require('./lib/secure.js');
const getRoutes = require('./routes/users.js');

const PostAPI = require('./datasources/PostAPI.js');
const UserAPI = require('./datasources/UserAPI.js');
const CommentAPI = require('./datasources/CommentAPI.js');

const typeDefs = require('./schema/index.js');
const resolvers = require('./resolvers/index.js');

const logger = morgan('combined');

const dataSources = () => ({
  postAPI: new PostAPI(db),
  userAPI: new UserAPI(db),
  commentAPI: new CommentAPI(db),
});

const context = (req) => getUser(req);

const createServer = () => {
  const app = express();
  app.use(cors());
  app.use(logger);
  app.use(graphqlUploadExpress());
  getRoutes(app);
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: [scalarTypeDefs, typeDefs],
    resolvers,
    dataSources,
    context,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  return { app, httpServer, server };
};

module.exports = { createServer, context, dataSources };
