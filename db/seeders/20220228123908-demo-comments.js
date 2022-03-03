const _ = require('lodash');
const { comments } = require('../index.js');

const commentsData = comments.map((comment) => _.omit(comment, ['id']));

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Comments', commentsData);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Comments', null, {});
  },
};
