require('dotenv').config();

module.exports = {
  development: {
    username: process.env.SEQUELIZE_NAME,
    password: process.env.SEQUELIZE_PASSWORD,
    database: process.env.SEQUELIZE_DATABASE,
    host: process.env.SEQUELIZE_HOST,
    dialect: 'mysql',
  },
  test: {
    username: process.env.SEQUELIZE_NAME,
    password: process.env.SEQUELIZE_PASSWORD,
    database: process.env.SEQUELIZE_DATABASE,
    host: process.env.SEQUELIZE_HOST,
    dialect: 'mysql',
  },
  production: {
    username: process.env.SEQUELIZE_NAME,
    password: process.env.SEQUELIZE_PASSWORD,
    database: process.env.SEQUELIZE_DATABASE,
    host: process.env.SEQUELIZE_HOST,
    dialect: 'mysql',
  },
};
