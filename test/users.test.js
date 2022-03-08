/*  eslint mocha/no-mocha-arrows: 0 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const { ApolloServer } = require('apollo-server');
const validator = require('validator');
const { expect } = require('chai');
const resolvers = require('../server/resolvers/index.js');
const typeDefs = require('../server/schema/index.js');
const { context, dataSources } = require('../server/index.js');
const { getUser } = require('../__fixtures__/entitiesData.js');
const db = require('../db/models');
const { encrypt } = require('../server/lib/secure.js');

describe('User', () => {
  let userData;
  let newUserData;
  let server;
  let httpServer;

  before(() => {
    userData = getUser();
    newUserData = getUser();
  });

  beforeEach(async () => {
    server = new ApolloServer({
      context, dataSources, resolvers, typeDefs,
    });
    const startServer = await server.listen({ port: 0 });
    httpServer = startServer.server;
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('Positive cases', () => {
    beforeEach(async () => {
      await db.sequelize.sync({ force: true, logging: false });
      await db.User.create({ ...userData, password: encrypt(userData.password) });
    });

    it('Signup user', async () => {
      const query = `
        mutation {
          signup(
              email: "${newUserData.email}",
              password: "${newUserData.password}",
              nickname: "${newUserData.nickname}"
          ){
            token
          }
        }
      `;

      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ query }));
      const tokenIsJWT = validator.isJWT(body.data.signup.token);
      expect(tokenIsJWT).to.be.true;
    });

    it('Login user', async () => {
      const query = `
        mutation {
          login(
              email: "${userData.email}",
              password: "${userData.password}",
          ){
            token
          }
        }
      `;
      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ query }));
      const tokenIsJWT = validator.isJWT(body.data.login.token);
      expect(tokenIsJWT).to.be.true;
    });
  });

  describe('Negative cases', () => {
    beforeEach(async () => {
      await db.sequelize.sync({ force: true, logging: false });
      await db.User.create({ ...userData, password: encrypt(userData.password) });
    });

    it('Signup user', async () => {
      const query = `
        mutation {
          signup(
              email: "user@mail",
              password: "${newUserData.password}",
              nickname: "${newUserData.nickname}"
          ){
            token
          }
        }
      `;

      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ query }));
      expect(body.errors).to.be.a('array');
      expect(body.errors[0].message).to.equal('Validation error: Invalid email address.');
    });

    it('Login user', async () => {
      const query = `
        mutation {
          login(
              email: "${userData.email}",
              password: "qwerty",
          ){
            token
          }
        }
      `;
      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ query }));
      expect(body.errors).to.be.a('array');
      expect(body.errors[0].message).to.equal('Invalid password.');
    });
  });
});
