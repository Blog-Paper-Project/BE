exports.isNotLoggedIn = (req, res, next) => {
  if (req.headers.authorization) {
    return res.status(400).send({ ereorMessage: '이미 로그인 되어있습니다.' });
  }
  next();
};
