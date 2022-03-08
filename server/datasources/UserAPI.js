const { DataSource } = require('apollo-datasource');
const { encrypt, generateToken } = require('../lib/secure.js');

class UserAPI extends DataSource {
  constructor(store) {
    super();
    this.store = store;
  }

  initialize(config) {
    this.context = config.context;
  }

  async createUser(args) {
    const { nickname, email, password } = args;
    const user = await this.store.User.create({ nickname, email, password: encrypt(password) });
    const userData = { id: user.id, nickname, email };
    return generateToken(userData);
  }

  async updateUser(args) {
    const { id } = this.context.user;
    await this.store.User.update({ avatarURL: args.location }, { where: { id } });
  }

  async loginUser(args) {
    const { email, password } = args;
    const userRecord = await this.store.User.findOne({ where: { email } });
    if (!userRecord) {
      throw new Error('No user found with this login credentials.');
    }
    const correctPassword = userRecord.verifyPassword(password);
    if (!correctPassword) {
      throw new Error('Invalid password.');
    }
    const userData = { id: userRecord.id, nickname: userRecord.nickname, email };
    return generateToken(userData);
  }
}

module.exports = UserAPI;
