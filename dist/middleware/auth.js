const jwt = require('jsonwebtoken');
const { User } = require('../../models');
require('dotenv').config;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const [tokenType, tokenValue] = authorization.split(' ');

  if (tokenType !== 'Bearer') {
    res.status(401).send({
      errorMessage: '로그인을 반드시 하고 사용 하세요',
    });
    return;
  }
  try {
    const { userId } = jwt.verify(tokenValue, process.env.ACCESS_TOKEN_KEY);
    User.findByPk(userId).then((user) => {
      res.locals.user = user;
      next();
    });
  } catch (err) {
    res.status(401).send({
      errorMessage: '로그인 후 이용 가능한 기능입니다.',
    });
  }
};
