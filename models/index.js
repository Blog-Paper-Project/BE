const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const User = require('./user');
const Paper = require('./paper');
const Comment = require('./comment');
const Tag = require('./tag');
const Booking = require('./booking');
const Leaf = require('./leaf');
const Review = require('./review');
const Image = require('./image');
const Point = require('./point');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: process.env.SEQUELIZE_HOST,
  dialect: 'mysql',
  timezone: '+09:00',
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true,
  },
  timezone: '+09:00',
  logging: false,
});

db.sequelize = sequelize;
db.User = User;
db.Paper = Paper;
db.Comment = Comment;
db.Tag = Tag;
db.Booking = Booking;
db.Leaf = Leaf;
db.Review = Review;
db.Image = Image;
db.Point = Point;

User.init(sequelize);
Paper.init(sequelize);
Comment.init(sequelize);
Tag.init(sequelize);
Booking.init(sequelize);
Leaf.init(sequelize);
Review.init(sequelize);
Image.init(sequelize);
Point.init(sequelize);

User.associate(db);
Paper.associate(db);
Comment.associate(db);
Tag.associate(db);
Booking.associate(db);
Leaf.associate(db);
Review.associate(db);
Image.associate(db);
Point.associate(db);

module.exports = db;
