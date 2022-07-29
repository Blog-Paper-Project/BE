const Sequelize = require('sequelize');

module.exports = class Leaf extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
        },
        giverId: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        recipientId: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        leaf: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        remarks: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Leaf',
        tableName: 'leafs',
        paranoid: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }
  static associate(db) {}
};
