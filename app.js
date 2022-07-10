const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const expressSession = require('express-session');
const passportConfig = require('./dist/modules/social');
require('dotenv').config();
require('./dist/modules/image_scheduler');

const app = express();

const UserRouter = require('./dist/routes/user.route');
const PaperRouter = require('./dist/routes/paper.route');
const BookingRouter = require('./dist/routes/booking.route');
const ReviewRouter = require('./dist/routes/review.route');

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
app.use('/api/paper/', PaperRouter);
app.use('/api/booking', BookingRouter);
app.use('/api/review', ReviewRouter);

app.get('/', (req, res) => {
  res.send('Paper-Project docker 진짜 성공?');
});

app.use((req, res) => {
  res.status(404).send('Page Not Found!');
});

app.use((err, req, res) => {
  const { status, message } = err;

  res.status(status || 500).json({ result: false, message });
});

module.exports = app;
