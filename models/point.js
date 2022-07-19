const Sequelize = require('sequelize');

module.exports = class Point extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
        },
        setPoint: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 5,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Point',
        tableName: 'points',
        paranoid: false,
      }
    );
  }
  static associate(db) {
    db.Point.belongsTo(db.User, {
      as: 'Points',
      foreignKey: 'userId',
      onDelete: 'cascde',
    });
  }
};
