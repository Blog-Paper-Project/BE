const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        commentId: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
        },
        text: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Comment',
        tableName: 'comments',
        paranoid: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }
  static associate(db) {
    db.Comment.belongsTo(db.Paper, {
      as: 'Posts',
      foreignKey: 'postId',
      onDelete: 'cascade',
    });
    db.Comment.belongsTo(db.User, {
      as: 'Users',
      foreignKey: 'userId',
      onDelete: 'cascade',
    });
  }
};
