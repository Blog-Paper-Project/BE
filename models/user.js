const Sequelize = require('sequelize');
const booking = require('./booking.js');
const leaf = require('./leaf.js');
const review = require('./review.js');

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
        },
        email: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        nickname: {
          type: Sequelize.STRING(30),
          allowNull: false,
          defaultValue: 'utf8mb4_general_ci',
        },
        profileImage: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        introduction: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        point: {
          type: Sequelize.INTEGER,
          defaultValue: '10',
        },
        popularity: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'local',
        },
        emailAuth: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.User.hasMany(db.Paper, { foreignKey: 'userId', onDelete: 'cascade' });
    db.User.hasMany(db.Comment, { foreignKey: 'userId', onDelete: 'cascade' });
    db.User.belongsToMany(db.Paper, {
      foreignKey: 'userId',
      as: 'Likes',
      through: 'likes',
      onDelete: 'cascade',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followeeId',
      as: 'Followees',
      through: 'subscriptions',
      onDelete: 'cascade',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followers',
      through: 'subscriptions',
      onDelete: 'cascade',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'hostId',
      as: 'host',
      through: booking,
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'guestId',
      as: 'guest',
      through: booking,
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'giverId',
      as: 'giver',
      through: leaf,
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'recipientId',
      as: 'recipient',
      through: leaf,
    });
    db.User.hasMany(db.Review, {
      foreignKey: 'userId',
    });
  }
};
