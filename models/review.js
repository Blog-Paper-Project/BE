const Sequelize = require('sequelize');

module.exports = class Review extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        reviewId: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
        },
        review: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        rate: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        reviewerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        revieweeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Review',
        tableName: 'reviews',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Review.belongsTo(db.User, {
      as: 'Reviewer',
      foreignKey: 'reviewerId',
      onDelete: 'cascade',
    });
  }
};
