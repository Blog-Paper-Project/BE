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
          type: Sequelize.STRING,
          allowNull: false,
        },
        time: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        accepted: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        leaf: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        sqlEnd: {
          type: Sequelize.STRING,
          allowNull: false,
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
  static associate(db) {
    db.Booking.belongsTo(db.User, {
      as: 'guest',
      foreignKey: 'guestId',
      onDelete: 'cascade',
    });
    db.Booking.belongsTo(db.User, {
      as: 'host',
      foreignKey: 'hostId',
      onDelete: 'cascade',
    });
  }
};
