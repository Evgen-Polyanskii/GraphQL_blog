const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const { typeDefs: scalarTypeDefs } = require('graphql-scalars');
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageProductionDefault,
  ApolloServerPluginLandingPageLocalDefault,
} = require('apollo-server-core');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const db = require('../db/models');
const { getUser } = require('./lib/secure.js');

const PostAPI = require('./datasources/PostAPI.js');
const UserAPI = require('./datasources/UserAPI.js');

const CommentAPI = require('./datasources/CommentAPI.js');
const typeDefs = require('./schema/index.js');
const resolvers = require('./resolvers/index.js');

const pathToEnv = path.resolve(__dirname, '../.env');

dotenv.config({ path: pathToEnv });

const port = process.env.PORT || 4000;

const logger = morgan('combined');

const dataSources = () => ({
  postAPI: new PostAPI(db),
  userAPI: new UserAPI(db),
  commentAPI: new CommentAPI(db),
});

const context = (req) => getUser(req);

const createServer = () => {
  const app = express();
  app.set('port', (port));
  app.use(cors());
  app.use(logger);
  app.use(graphqlUploadExpress());
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: [scalarTypeDefs, typeDefs],
    resolvers,
    dataSources,
    context,
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault({
          graphRef: 'voltblog-1tc1wn@current',
          footer: false,
        })
        : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
  });

  return { app, httpServer, server };
};

module.exports = { createServer, context, dataSources };
