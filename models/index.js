const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const User = require('./user');
const Paper = require('./paper');
const Comment = require('./comment');
const Tag = require('./tag');
const Booking = require('./booking');
const Leaf = require('./leaf');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: '127.0.0.1',
  dialect: 'mysql',
  timezone: '+09:00',
  dialectOptions: { charset: 'utf8mb4', dateStrings: true, typeCast: true },
});

db.sequelize = sequelize;
db.User = User;
db.Paper = Paper;
db.Comment = Comment;
db.Tag = Tag;
db.Booking = Booking;
db.Leaf = Leaf;

User.init(sequelize);
Paper.init(sequelize);
Comment.init(sequelize);
Tag.init(sequelize);
Booking.init(sequelize);
Leaf.init(sequelize);

User.associate(db);
Paper.associate(db);
Comment.associate(db);
Tag.associate(db);
Booking.associate(db);
Leaf.associate(db);

module.exports = db;
