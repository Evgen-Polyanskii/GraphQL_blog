/*  eslint mocha/no-mocha-arrows: 0 */

const request = require('supertest');
const { expect } = require('chai');
const { ApolloServer } = require('apollo-server');
const resolvers = require('../server/resolvers/index.js');
const typeDefs = require('../server/schema/index.js');
const { context, dataSources } = require('../server/index.js');
const { getUser } = require('../__fixtures__/entitiesData.js');
const db = require('../db/models');
const { encrypt, generateToken } = require('../server/lib/secure.js');

describe('Index', () => {
  let userData;
  let server;
  let httpServer;

  before(async () => {
    await db.sequelize.sync({ force: true, logging: false });
    server = new ApolloServer({
      context, dataSources, resolvers, typeDefs,
    });
    const startServer = await server.listen({ port: 0 });
    httpServer = startServer.server;
    userData = getUser();
  });

  after(async () => {
    await server.stop();
  });

  it('return http code 200', async () => {
    await request(httpServer)
      .get('/.well-known/apollo/server-health')
      .expect(200, { status: 'pass' });
  });

  it('GetAnalyticalReport, negative cases', async () => {
    const user = await db.User.create({ ...userData, password: encrypt(userData.password) });
    const { id, email, nickname } = user.dataValues;
    const token = generateToken({ id, email, nickname });
    const query = `
      query {
        getAnalyticalReport(
          startDate: "2022-02-28",
          endDate: "2022-03-08",
          email: "qwerty@mail"
        ){
          message
        }
      }
    `;
    const { body } = await request(httpServer)
      .post('/')
      .set('content-type', 'application/json')
      .set('Authorization', `Bearer ${token.token}`)
      .send(JSON.stringify({ query }));
    expect(body).to.have.property('errors');
    expect(body.errors[0].message).to.equal('Invalid email address.');
  });
});
