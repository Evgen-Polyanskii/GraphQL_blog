const _ = require('lodash');
const { posts } = require('../index.js');

const postsData = posts.map((post) => _.omit(post, ['id']));

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Posts', postsData);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Posts', null, {});
  },
};
