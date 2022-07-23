const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const expressSession = require('express-session');
const passportConfig = require('./dist/modules/social');
const redis = require('redis');

require('dotenv').config();
require('./dist/modules/node_cron');
require('./dist/modules/transfer');
require('./dist/modules/image_scheduler');

// redis 연결
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
  legacyMode: true,
});
redisClient.on('connect', () => {
  console.info('🟢 Redis 연결 성공!');
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
redisClient.connect().then();
exports.redisCli = redisClient; //  v4버젼은 프로미스 기반이라 사용

require('./dist/modules/node_cron');
require('./dist/modules/image_scheduler');
require('./dist/modules/view_count_scheduler');
require('./dist/modules/transfer');

const app = express();

const UserRouter = require('./dist/routes/user.route');
const PaperRouter = require('./dist/routes/paper.route');
const BookingRouter = require('./dist/routes/booking.route');
const ReviewRouter = require('./dist/routes/review.route');

passportConfig();

app.use(cors());
app.use(helmet());
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
app.use('/api/paper', PaperRouter);
app.use('/api/booking', BookingRouter);
app.use('/api/review', ReviewRouter);

app.get('/', (req, res) => {
  res.send('Paper-Project 진짜 ');
});

app.use((req, res) => {
  res.status(404).send('Page Not Found!');
});

app.use((err, req, res) => {
  const { status, message } = err;

  res.status(status || 500).json({ result: false, message });
});

module.exports = app;
