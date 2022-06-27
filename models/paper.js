const Sequelize = require('sequelize');

module.exports = class Paper extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
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
    db.Paper.belongsTo(db.User);
    db.Paper.belongsToMany(db.User, {
      foreignKey: 'paperId',
      through: 'likes',
      as: 'Likes',
    });
    db.Paper.hasMany(db.Comment);
    db.Paper.hasMany(db.Tag);
  }
};
