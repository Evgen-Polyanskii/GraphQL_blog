#! /usr/bin/env node

const { createServer } = require('../index.js');
const db = require('../../db/models');

const { app, httpServer, server } = createServer();

db.sequelize.authenticate()
  .then(() => db.sequelize.sync({ alter: true, logging: false }))
  .then(() => server.start())
  .then(() => server.applyMiddleware({ app, path: '/graphql' }))
  .then(() => httpServer.listen(app.get('port'),(err) => {
    if (err) {
      console.log('Error', err);
    }
    console.log(`Apollo Server on http://localhost:${app.get('port')}/graphql`);
  }))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
