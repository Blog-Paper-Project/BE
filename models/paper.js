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
          type: Sequelize.STRING(140),
          allowNull: false,
        },
        contents: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        category: {
          type: Sequelize.STRING(140),
          allowNull: true,
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
    db.Paper.belongsTo(db.User, { as: 'Users', foreignKey: 'userId' });
    db.Paper.belongsToMany(db.User, {
      foreignKey: 'postId',
      through: 'likes',
      as: 'Likes',
    });
    db.Paper.hasMany(db.Comment, { foreignKey: 'postId' });
    db.Paper.hasMany(db.Tag, { foreignKey: 'postId' });
  }
};
