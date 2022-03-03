const { faker } = require('@faker-js/faker');

const getUser = () => ({
  email: faker.internet.email(),
  password: faker.internet.password(10),
  nickname: faker.internet.userName(),
});

const getPost = () => ({
  title: faker.lorem.words(2),
  body: faker.lorem.sentence(4),
});

const getComment = () => ({
  body: faker.lorem.words(2),
  postId: 1,
});

module.exports = { getUser, getPost, getComment };
