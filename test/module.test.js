/*  eslint mocha/no-mocha-arrows: 0 */

process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const { getUser, getPost, getComment } = require('../__fixtures__/entitiesData.js');
const db = require('../db/models');
const { encrypt } = require('../server/lib/secure.js');
const { getAnalyticalReport } = require('../server/lib/getAnalyticalReport.js');

describe('Module tests', () => {
  let user;
  let userData;
  let postsData;
  let commentsData;
  let startDate;

  before(async () => {
    startDate = new Date((Date.now() - 86400000));
    await db.sequelize.sync({ force: true, logging: false });
    userData = getUser();
    postsData = [getPost(), getPost(), getPost()];
    commentsData = [getComment(), getComment(), getComment()];
    user = await db.User.create({ ...userData, password: encrypt(userData.password) });
    await postsData.forEach((postData) => db.Post.create({ ...postData, author_id: user.id }));
    await commentsData.forEach((commentData) => db.Comment.create({
      ...commentData,
      author_id: user.id,
      post_id: 1,
    }));
  });

  it('getAnalyticalReport', async () => {
    const newUserData = getUser();
    const newPost = getPost();
    const newUser = await db.User.create({
      ...newUserData, password: encrypt(newUserData.password),
    });
    await db.Post.create({ ...newPost, author_id: newUser.id });
    const endDate = new Date(Date.now());
    const report = await getAnalyticalReport(startDate.toISOString(), endDate.toISOString());
    expect(report).to.have.lengthOf(2);
    expect(report[0].countPosts).to.equal(3);
    expect(report[0].countComments).to.equal(3);
  });
});
