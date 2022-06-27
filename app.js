const express = require('express');
const port = 6000;
const app = express();
const Http = require('http');
const http = Http.createServer(app);

module.exports = http;

// require('./modules/socket');

const db = require('./models');

const cors = require('cors');
const morgan = require('morgan');
const paper = require('./dist/routes/paper');

db.sequelize
  .sync({ force: true })
  .then(() => console.log('🟢 db 연결 성공'))
  .catch(console.error);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/paper/', paper);

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

http.listen(port, () => {
  console.log('🟢', port, '번 포트');
});
