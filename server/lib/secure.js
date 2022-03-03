const { ForbiddenError } = require('apollo-server');
const { skip } = require('graphql-resolvers');
const crypto = require('crypto');
const path = require('path');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const pathToEnv = path.resolve(__dirname, '../../.env');

dotenv.config({ path: pathToEnv });

const signature = process.env.SESSION_KEY;

const encrypt = (value) => crypto.createHash('sha256')
  .update(value)
  .digest('hex');

const generateToken = (payload) => {
  const expiration = '5h';
  const token = jwt.sign(payload, signature, { expiresIn: expiration });
  return { token };
};

const getUser = ({ req }) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    const token = req.headers.authorization.split(' ')[1];
    const user = jwt.verify(token, signature);
    return { user };
  }
  return null;
};

const isAuthenticated = (parent, args, { user }) => (user ? skip : new ForbiddenError('Not authenticated as user.'));

module.exports = {
  encrypt, generateToken, getUser, isAuthenticated,
};
