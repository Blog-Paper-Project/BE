const express = require('express');
const app = express();
const Http = require('http');
const http = Http.createServer(app);
const UserRouter = require('./dist/router/user');
require('dotenv').config();
const port = process.env.PORT;

module.exports = http;

// require('./modules/socket');

const db = require('./models');

const cors = require('cors');
const morgan = require('morgan');

db.sequelize
  .sync({ force: false })
  .then(() => console.log('🟢 db 연결 성공'))
  .catch(console.error);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/', UserRouter);

app.get('/', (req, res, next) => {
  res.send('Paper-Project');
});

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

http.listen(port, () => {
  console.log('🟢', '서버연결');
});
