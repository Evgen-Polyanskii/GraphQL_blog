const _ = require('lodash');
const { users } = require('../index.js');

const userData = users.map((user) => _.omit(user, ['id']));

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Users', userData);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
