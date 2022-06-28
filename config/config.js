require('dotenv').config();

module.exports = {
  development: {
    username: 'root',
    password: process.env.SEQUELIZE_PASSWORD,
    database: 'paper',
    host: 'database-1.ctqwwyyctbbp.ap-northeast-2.rds.amazonaws.com',
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: process.env.SEQUELIZE_PASSWORD,
    database: 'paper_test',
    host: 'database-1.ctqwwyyctbbp.ap-northeast-2.rds.amazonaws.com',
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: process.env.SEQUELIZE_PASSWORD,
    database: 'paper_production',
    host: 'database-1.ctqwwyyctbbp.ap-northeast-2.rds.amazonaws.com',
    dialect: 'mysql',
  },
};
