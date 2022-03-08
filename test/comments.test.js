/*  eslint mocha/no-mocha-arrows: 0 */
/*  eslint mocha/no-setup-in-describe: 0 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const { ApolloServer } = require('apollo-server');
const { expect } = require('chai');
const resolvers = require('../server/resolvers/index.js');
const typeDefs = require('../server/schema/index.js');
const { context, dataSources } = require('../server/index.js');
const { getUser, getPost, getComment } = require('../__fixtures__/entitiesData.js');
const db = require('../db/models');
const { encrypt, generateToken } = require('../server/lib/secure.js');

describe('Comment', () => {
  let userData;
  let postData;
  let commentData;
  let server;
  let httpServer;

  before(() => {
    userData = getUser();
    postData = getPost();
    commentData = getComment();
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

    it('Create comment, positive cases', async () => {
      const post = await db.Post.create({ ...postData, author_id: user.id });
      const query = `
        mutation {
          createComment(
              postId: ${(post.id)},
              body: "${commentData.body}",
          ){
            id
            postId
            
            body
            authorsNickname
            published_at
          }
        }
      `;
      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${token.token}`)
        .send(JSON.stringify({ query }));
      expect(body.data.createComment).to.include(commentData);
      expect(body.data.createComment).to.have.property('published_at');
    });

    it('Create comment, negative cases', async () => {
      const query = `
        mutation {
          createComment(
              body: "${commentData.body}",
          ){
            id
            postId
            
            body
            authorsNickname
            published_at
          }
        }
      `;
      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${token.token}`)
        .send(JSON.stringify({ query }));
      expect(body).to.have.property('errors');
      expect(body.errors).to.be.a('array');
    });
  });

  describe('Query', () => {
    const commentsData = [getComment(), getComment(), getComment()];
    let user;
    let token;
    let post;

    beforeEach(async () => {
      await db.sequelize.sync({ force: true, logging: false });
      user = await db.User.create({ ...userData, password: encrypt(userData.password) });
      const { id, email, nickname } = user.dataValues;
      token = generateToken({ id, email, nickname });
      post = await db.Post.create({ ...postData, author_id: user.id });
      await commentsData.forEach((value) => db.Comment.create({
        ...value,
        author_id: user.id,
        post_id: post.id,
      }));
    });

    it('getUserComments', async () => {
      const query = `
        query {
          getUserComments(
            page: 2
            perPage: 1
          ){
            totalComments
            totalPages
            lastPage
            comments {
              post
              published_at
              body
            }
          }
        }
      `;
      const { body } = await request(httpServer)
        .post('/')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${token.token}`)
        .send(JSON.stringify({ query }));
      const userComments = body.data.getUserComments;
      expect(userComments.lastPage).to.be.false;
      expect(userComments.totalComments).to.equal(3);
      expect(userComments.totalPages).to.equal(3);
    });
  });
});
