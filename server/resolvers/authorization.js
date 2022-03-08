const { ForbiddenError } = require('apollo-server');
const { skip } = require('graphql-resolvers');

const isAuthenticated = (parent, args, { user }) => (user ? skip : new ForbiddenError('Not authenticated as user.'));

module.exports = isAuthenticated;
