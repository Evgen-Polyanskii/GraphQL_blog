#! /usr/bin/env node

const path = require('path');
const dotenv = require('dotenv');
const createServer = require('../index.js');
const db = require('../../db/models');

const pathToEnv = path.resolve(__dirname, '../.env');

dotenv.config({ path: pathToEnv });

const port = process.env.PORT || 4000;
const host = process.env.HOST || 'localhost';

const { app, httpServer, server } = createServer();

db.sequelize.authenticate()
  .then(() => db.sequelize.sync({ alter: true, logging: false }))
  .then(() => server.start())
  .then(() => server.applyMiddleware({ app, path: '/graphql' }))
  .then(() => httpServer.listen(port, host, (err) => {
    if (err) {
      console.log('Error', err);
    }
    console.log(`Apollo Server on http://${host}:${port}/graphql`);
  }))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
