const Sequelize = require('sequelize');

module.exports = class Booking extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        bookingId: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
        },

        date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        time: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        accepted: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Booking',
        tableName: 'bookings',
        paranoid: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }
  static associate(db) {}
};
