const { DataTypes, Model } = require('sequelize');
const { encrypt } = require('../../server/lib/secure.js');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, { foreignKey: 'author_id', as: 'posts', onDelete: 'CASCADE' });
      User.hasMany(models.Comment, { foreignKey: 'author_id', as: 'comments', onDelete: 'CASCADE' });
    }

    verifyPassword(password) {
      return encrypt(password) === this.password;
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { args: true, msg: 'Nickname must be unique.' },
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { args: true, msg: 'Email must be unique.' },
      validate: {
        notEmpty: true,
        isEmail: { args: true, msg: 'Invalid email address.' },
      },
    },
    avatarURL: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    timestamps: true,
    modelName: 'User',
    tableName: 'Users',
  });

  return User;
};
