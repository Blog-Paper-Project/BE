const Sequelize = require('sequelize');

module.exports = class Paper extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        postId: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
        },
        title: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        contents: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        thumbnail: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        category: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'etc',
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Paper',
        tableName: 'papers',
        paranoid: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }
  static associate(db) {
    db.Paper.belongsTo(db.User, {
      as: 'Users',
      foreignKey: 'userId',
      onDelete: 'cascade',
    });
    db.Paper.belongsToMany(db.User, {
      foreignKey: 'postId',
      as: 'Likes',
      through: 'likes',
      onDelete: 'cascade',
    });
    db.Paper.hasMany(db.Comment, { foreignKey: 'postId', onDelete: 'cascade' });
    db.Paper.hasMany(db.Tag, { foreignKey: 'postId', onDelete: 'cascade' });
    db.Paper.hasMany(db.Image, { foreignKey: 'postId', onDelete: 'cascade' });
  }
};
