//db 쿼리 연결

const mysql = require('mysql2');
require('dotenv').config();

//mysql 접속 설정
const paper = mysql.createConnection({
  host: process.env.SEQUELIZE_HOST,
  user: process.env.SEQUELIZE_NAME,
  password: process.env.SEQUELIZE_PASSWORD,
  database: process.env.SEQUELIZE_DATABASE,
  port: process.env.SEQUELIZE_PORT,
});

paper.connect();
console.log('db연결!');

module.exports = paper;
