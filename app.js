const express = require('express');
const app = express();
const Http = require('http');
const http = Http.createServer(app);
const UserRouter = require('./dist/routes/user');
require('dotenv').config();

const port = process.env.PORT;

module.exports = http;

// require('./modules/socket');

const db = require('./models');

const cors = require('cors');
const morgan = require('morgan');
const paper = require('./dist/routes/paper.route');

db.sequelize
  .sync({ force: true })
  .then(() => console.log('🟢 db 연결 성공'))
  .catch(console.error);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/user', UserRouter);

app.use('/api/paper/', paper);

app.get('/', (req, res, next) => {
  res.send('Paper-Project');
});

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  const { status, message } = err;

  res.status(status || 500).json({ success: false, message });
});

http.listen(port, () => {
  console.log('🟢', '서버연결');
});
