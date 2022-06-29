const express = require('express');
const app = express();
const Http = require('http');
const http = Http.createServer(app);
const passportConfig = require('./dist/modules/social');
const passport = require('passport');
const expressSession = require('express-session');
require('dotenv').config();

const port = process.env.PORT;

module.exports = http;

// require('./modules/socket');

const db = require('./models');

const cors = require('cors');
const morgan = require('morgan');
const UserRouter = require('./dist/routes/user.route');
const paperRouter = require('./dist/routes/paper.route');
const BookingRouter = require('./dist/routes/booking.route');

db.sequelize
  .sync({ force: true, logging: false })
  .then(() => console.log('🟢 db 연결 성공'))
  .catch(console.error);

passportConfig();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: 'secret',
    cookie: { httpOnly: true, secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/user', UserRouter);
app.use('/api/paper/', paperRouter);
app.use('/api/booking', BookingRouter);

app.get('/', (req, res, next) => {
  res.send('Paper-Project');
});

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  const { status, message } = err;

  res.status(status || 500).json({ result: false, message });
});

http.listen(port, () => {
  console.log('🟢', '서버연결');
});
