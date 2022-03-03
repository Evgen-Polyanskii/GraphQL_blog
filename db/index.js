const crypto = require('crypto');
const _ = require('lodash');
const { faker } = require('@faker-js/faker');

const buildUser = ({ id }) => ({
  id,
  nickname: faker.internet.userName(),
  email: faker.internet.email(),
  password: crypto.createHash('sha256').digest('hex'),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const buildPost = ({ id, user }) => ({
  id,
  title: faker.lorem.words(2),
  body: faker.lorem.text(4),
  author_id: user.id,
  published_at: faker.date.recent(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const buildComment = ({ id, user, post }) => ({
  id,
  body: faker.lorem.words(2),
  post_id: post.id,
  author_id: user.id,
  published_at: faker.date.recent(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createDataForTable = () => {
  const result = { users: [], posts: [], comments: [] };

  for (let i = 1; i < 15; i += 1) {
    const user = buildUser({ id: i });
    result.users.push(user);
  }

  for (let i = 1; i < 20; i += 1) {
    const user = _.sample(result.users);
    const post = buildPost({ user, id: i });
    result.posts.push(post);
  }

  for (let i = 1; i < 25; i += 1) {
    const user = _.sample(result.users);
    const post = _.sample(result.posts);
    const comment = buildComment({ user, id: i, post });
    result.comments.push(comment);
  }

  return result;
};

module.exports = createDataForTable();
