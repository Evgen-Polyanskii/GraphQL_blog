/*  eslint mocha/no-mocha-arrows: 0 */
/*  eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]  */

process.env.NODE_ENV = 'test';

const chai = require('chai');
const validator = require('validator');
const { Mutation } = require('../server/src/resolvers.js');
const PostAPI = require('../server/src/datasources/PostAPI.js');
const UserAPI = require('../server/src/datasources/UserAPI.js');
const CommentAPI = require('../server/src/datasources/CommentAPI.js');
const db = require('../db/models');
const { getUser, getPost, getComment } = require('../__fixtures__/entitiesData.js');
const setContext = require('../__fixtures__/utils.js');
const { encrypt } = require('../server/lib/secure.js');

const should = chai.should();

let context;
let userData;
let postData;
let commentData;

describe('positive cases', () => {
  let user;

  before(() => {
    userData = getUser();
    postData = getPost();
    commentData = getComment();
    context = {
      dataSources: {
        postAPI: new PostAPI(db),
        userAPI: new UserAPI(db),
        commentAPI: new CommentAPI(db),
      },
    };
  });

  beforeEach(async () => {
    await db.sequelize.sync({ force: true, logging: false });
    user = await db.User.create({ ...userData, password: encrypt(userData.password) });
    context = setContext(context, user);
  });

  it('Signup user', async () => {
    const newUserData = getUser();
    const { token } = await Mutation.signup(null, newUserData, context);
    const tokenIsJWT = validator.isJWT(token);
    tokenIsJWT.should.be.a.true;
  });

  it('Login user', async () => {
    const { token } = await Mutation.login(null, {
      email: userData.email,
      password: userData.password,
    }, context);
    const tokenIsJWT = validator.isJWT(token);
    tokenIsJWT.should.be.a.true;
  });

  it('Create Post', async () => {
    const post = await Mutation.createPost(null, postData, context);
    post.should.be.include(postData);
    post.authorsNickname.should.be.a.equal(user.nickname);
    post.should.have.property('published_at');
  });

  it('createComment', async () => {
    await db.Post.create({ ...postData, author_id: user.id });
    const comment = await Mutation.createComment(null, commentData, context);
    comment.should.be.include(commentData);
    comment.authorsNickname.should.be.a.equal(user.nickname);
    comment.should.have.property('published_at');
  });
});

describe('Negative cases', () => {
  let user;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true, logging: false });
    user = await db.User.create({ ...userData, password: encrypt(userData.password) });
    context = setContext(context, user);
  });

  it('Signup user', async () => {
    try {
      const newUserData = getUser();
      await Mutation.signup(null, { ...newUserData, email: 'user@nsn' }, context);
    } catch (err) {
      err.should.be.a.Throw;
      err.message.should.be.a.equal('Validation error: Invalid email address.');
    }
  });

  it('Login user', async () => {
    try {
      const newUserData = getUser();
      await Mutation.signup(null, newUserData, context);
      await Mutation.login(null, { email: newUserData.email, password: 'qwerty' }, context);
    } catch (err) {
      err.should.be.a.Throw;
      err.message.should.be.a.equal('Invalid password.');
    }
  });

  it('Create post', async () => {
    try {
      await Mutation.createPost(null, { title: postData.title }, context);
    } catch (err) {
      err.should.be.a.Throw;
      err.message.should.be.a.equal('notNull Violation: Post.body cannot be null');
    }
  });

  it('Create comment', async () => {
    try {
      await db.Post.create({ ...postData, author_id: user.id });
      await Mutation.createComment(null, { body: commentData.body }, context);
    } catch (err) {
      err.should.be.a.Throw;
      err.message.should.be.a.equal('Post not found.');
    }
  });
});
