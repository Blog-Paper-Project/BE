const Sequelize = require('sequelize');

module.exports = class Tag extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        tagId: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        tagName: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Tag',
        tableName: 'tags',
        paranoid: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }
  static associate(db) {
    db.Tag.belongsTo(db.Paper, { as: 'Posts', foreignKey: 'postId' });
  }
};
