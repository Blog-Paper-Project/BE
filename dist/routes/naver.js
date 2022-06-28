const passport = require('passport');
const naver = require('../routes/naverStrategy'); // 네이버서버로 로그인할때
const User = require('../../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.userId);
  });

  passport.deserializeUser((user, done) => {
    User.findOne({
      where: { userId: user.userId || null },
    })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  naver(); // 네이버 전략 등록
};
