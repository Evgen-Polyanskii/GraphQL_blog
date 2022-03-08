/*  eslint mocha/no-mocha-arrows: 0 */
/*  eslint mocha/no-setup-in-describe: 0 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const { ApolloServer } = require('apollo-server');
const { expect } = require('chai');
const resolvers = require('../server/resolvers/index.js');
const typeDefs = require('../server/schema/index.js');
const { context, dataSources } = require('../server/index.js');
const { getUser, getPost } = require('../__fixtures__/entitiesData.js');
const db = require('../db/models');
const { encrypt, generateToken } = require('../server/lib/secure.js');

describe('Posts', () => {
  let userData;
  let postData;
  let server;
  let httpServer;

  before(() => {
    userData = getUser();
    postData = getPost();
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

  describe('Mutation', () => {
    let user;
    let token;

    beforeEach(async () => {
      await db.sequelize.sync({ force: true, logging: false });
      user = await db.User.create({ ...userData, password: encrypt(userData.password) });
      const { id, email, nickname } = user.dataValues;
      token = generateToken({ id, email, nickname });
    });

    it('Create post, positive cases', async () => {
      const query = `
        mutation {
          createPost(
              title: "${postData.title}",
              body: "${postData.body}",
          ){
            id
            published_at
            body
            title
          }
        }
      `;
      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${token.token}`)
        .send(JSON.stringify({ query }));
      expect(body.data.createPost).to.include(postData);
      expect(body.data.createPost).to.have.property('published_at');
    });

    it('Create post, negative cases', async () => {
      const query = `
        mutation {
          createPost(
              title: "",
              body: "${postData.body}",
          ){
            id
            published_at
            body
            title
          }
        }
      `;
      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${token.token}`)
        .send(JSON.stringify({ query }));
      expect(body.errors).to.be.a('array');
      expect(body.errors[0].message).to.equal('Validation error: Validation notEmpty on title failed');
    });
  });

  describe('Query', () => {
    const postsData = [getPost(), getPost(), getPost()];
    let user;
    let token;

    beforeEach(async () => {
      await db.sequelize.sync({ force: true, logging: false });
      user = await db.User.create({ ...userData, password: encrypt(userData.password) });
      const { id, email, nickname } = user.dataValues;
      await postsData.forEach((value) => db.Post.create({ ...value, author_id: id }));
      token = generateToken({ id, email, nickname });
    });

    it('getPostById', async () => {
      const query = `
        query {
          getPostById(
            id: 2
          ){
            title
            body
            published_at
          }
        }
      `;
      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${token.token}`)
        .send(JSON.stringify({ query }));
      expect(body.data.getPostById).to.include(postsData[1]);
    });

    it('getPostsList', async () => {
      const query = `
        query {
          getPostsList(
            page: 2
            perPage: 1
          ){
            totalPosts
            totalPages
            lastPage
            posts {
              title
              body
              published_at
            }
          }
        }
      `;
      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${token.token}`)
        .send(JSON.stringify({ query }));
      const postsList = body.data.getPostsList;
      expect(postsList.lastPage).to.be.false;
      expect(postsList.totalPosts).to.equal(3);
      expect(postsList.totalPages).to.equal(3);
    });
  });
});
