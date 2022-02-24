const _ = require('lodash');

const setContext = (context, user) => {
  _.forEach(context.dataSources, (value) => {
    value.initialize({
      context: {
        user: {
          userId: user.dataValues.id,
          nickname: user.dataValues.nickname,
          email: user.dataValues.email,
        },
      },
    });
  });
  return { ...context, user: user.dataValues };
};

module.exports = setContext;
