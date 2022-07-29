const Sequelize = require('sequelize');
const bookings = require('./booking');
const leafs = require('./leaf');

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
          allowNull: true,
        },
        blogId: {
          type: Sequelize.STRING(40),
          allowNull: true,
        },
        nickname: {
          type: Sequelize.STRING(30),
          allowNull: true,
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
          defaultValue: 10,
          allowNull: false,
        },
        popularity: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'local',
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        setPoint: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'User',
        tableName: 'users',
        paranoid: false,
        charset: 'utf8mb4',
        collate: ' utf8mb4_unicode_ci',
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
      as: 'Followers',
      through: 'subscriptions',
      onDelete: 'cascade',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followees',
      through: 'subscriptions',
      onDelete: 'cascade',
    });
    db.User.hasMany(db.Review, {
      foreignKey: 'userId',
    });
  }
};
