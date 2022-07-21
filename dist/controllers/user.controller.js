const Bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const userService = require('../services/user.service');
const passport = require('passport');
const Validatorsinup = require('../middleware/signup.validator');
const Validatorlogin = require('../middleware/login.validator');

require('dotenv').config();

// 카카오 로그인
exports.kakaoCallback = (req, res, next) => {
  passport.authenticate('kakao', (err, user) => {
    if (err) return next(err);
    const { nickname, userId, profileImage, blogId, email } = user;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY);

    res.status(200).json({
      result: true,
      token,
      nickname,
      profileImage,
      blogId,
      userId,
      email,
    });
  })(req, res, next);
};

// 네이버 로그인
exports.naverCallback = (req, res, next) => {
  passport.authenticate('naver', (err, user, info) => {
    if (err) return next(err);

    const { nickname, userId, profileImage, blogId, email } = user;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY);

    res.status(200).send({
      result: true,
      token,
      nickname,
      profileImage,
      blogId,
      userId,
      email,
    });
  })(req, res, next);
};

// 구글 로그인
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) return next(err);
    const { nickname, userId, profileImage, blogId, email } = user;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY);

    res.status(200).send({
      result: true,
      token,
      nickname,
      profileImage,
      blogId,
      userId,
      email,
    });
  })(req, res, next);
};

//회원가입
exports.signup = async (req, res, next) => {
  const { email, nickname, password, blogId } = await Validatorsinup.validateAsync(
    req.body
  );

  const duplicate = await userService.signup(email, nickname, password, blogId);
  if (duplicate === false) {
    return res.status(400).send({
      result: false,
    });
  } else {
    res.status(200).send({
      result: true,
    });
  }
};

// 소셜 회원가입
exports.social_signup = async (req, res, next) => {
  const { blogId, nickname, email } = req.body;

  const social_duplicate = await userService.social_signup(blogId, nickname, email);

  if (social_duplicate === false) {
    return res.status(400).send({
      result: false,
    });
  }
  res.status(200).send({
    result: true,
  });
};

// 회원탈퇴
exports.userDelete = async (req, res, next) => {
  const { user } = res.locals;
  const deletedAt = new Date();
  await userService.userDelete(user, deletedAt);

  res.status(200).send({
    result: true,
  });
};

// 회원복구
exports.user_restore = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userService.login(email);
  const passwordck = await Bcrypt.compare(password, user.password);

  // 이메일이 틀리거나 패스워드가 틀렸을때
  if (!user || !passwordck) {
    return res.status(400).send({
      result: false,
    });
  }

  await userService.user_restore(email);
  res.status(200).send({
    result: true,
    msg: '회원복구 완료',
  });
};

// 로그인
exports.login = async (req, res, next) => {
  // const session = req.sessionID;
  const { email, password } = await Validatorlogin.validateAsync(req.body);
  const user = await userService.login(email);
  const passwordck = await Bcrypt.compare(password, user.password);

  // if (user.snsId !== snsId && snsId !== null) {
  //   return res.status(400).send({
  //     result: false,
  //     message: '다른 곳에서 로그인 중입니다.',
  //   });
  // }

  // 탈퇴한 회원
  if (user.deletedAt) {
    return res.status(400).send({
      result: false,
      msg: '탈퇴한 회원입니다',
    });
  }

  // 이메일이 틀리거나 패스워드가 틀렸을때
  if (!user || !passwordck) {
    return res.status(400).send({
      result: false,
    });
  }
  const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, {
    expiresIn: 60 * 60 * 3, //60초 * 60분 * 3시 이므로, 3시간 유효한 토큰 발급
  });
  res.status(200).send({
    result: true,
    nickname: user.nickname,
    profileImage: user.profileImage,
    token,
    userId: user.userId,
    blogId: user.blogId,
    //session,
  });
};

// 블로그 아이디 중복검사
exports.blogcheck = async (req, res, next) => {
  const { blogId } = req.body;

  const blogidch = await userService.blogcheck(blogId);

  if (blogidch) {
    return res.status(400).send({
      result: false,
    });
  }
  res.status(200).send({
    result: true,
  });
};

// 이메일 || 닉네임 중복검사
exports.duplicate = async (req, res, next) => {
  const id = req.body.email || req.body.nickname;
  const idcheck = await userService.duplicate(id);

  if (idcheck[0]?.email === id || idcheck[0]?.nickname === id) {
    return res.status(400).send({
      result: false,
    });
  }

  res.status(200).send({
    result: true,
  });
};

// 마이프로필 조회
exports.myprofile = async (req, res, next) => {
  const { user } = res.locals;
  const myprofile = await userService.myprofile(user);

  res.status(200).send({
    myprofile,
  });
};

// 마이프로필 수정
exports.myprofile_correction = async (req, res, next) => {
  const { user } = res.locals;
  const profileImage = req.file?.transforms[0].key;
  const { nickname, introduction } = req?.body;

  // 닉네임 안에 정규식이 포함 되어 있으면 true, 없으면 false
  const nickname_validator = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+$/.test(nickname);

  // 닉네임 유효성 검사
  if (3 > nickname?.length || nickname?.length > 15) {
    return res
      .status(400)
      .send({ ValidationError: '3글자 ~ 15글자 이내로 작성해주세요' });
  } else if (!nickname_validator) {
    return res
      .status(400)
      .send({ ValidationError: '한글,숫자, 알파벳 대소문자로 입력해주세요' });
  }
  const profileimg = await userService.myprofile_correction(
    user,
    profileImage,
    nickname,
    introduction
  );

  if (profileimg === false) {
    return res.status(400).send({
      result: false,
    });
  }

  res.status(200).send(profileimg);
};

// 이메일 인증
exports.emailauth = async (req, res, next) => {
  const { email } = req.body;
  // 인증메일 (번호)
  const emailAuth = Math.floor(Math.random() * 10000);

  await userService.emailauth(email, emailAuth);

  const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: `"Paper 환영합니다" <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject: '[Paper] 인증번호가 도착했습니다.',
    text: `${emailAuth}`,
  });

  res.status(200).json({
    result: true,
  });
};

// 이메일 인증 체크
exports.check_emaliauth = async (req, res, next) => {
  const { email, emailAuth } = req.body;
  const text = await userService.check_emaliauth(email);

  console.log(text, emailAuth);
  if (emailAuth === text) {
    await userService.delet_check_emaliauth(email);
    return res.status(200).send({
      result: true,
    });
  }

  res.status(400).send({
    result: false,
  });
};

// 비밀번호 변경
exports.change_password = async (req, res, next) => {
  const { email, password } = req.body;

  await userService.change_password(email, password);

  res.status(200).send({
    result: true,
  });
};

// 이메일 인증 (로그인 시)
exports.login_emailauth = async (req, res, next) => {
  const { user } = res.locals;
  console.log(user.email);
  // 인증메일 (번호)
  const emailAuth = Math.floor(Math.random() * 10000);

  await userService.login_emailauth(user, emailAuth);

  const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: `"Paper 환영합니다" <${process.env.NODEMAILER_USER}>`,
    to: user.email,
    subject: '[Paper] 인증번호가 도착했습니다.',
    text: `${emailAuth}`,
  });

  res.status(200).json({
    result: true,
  });
};

// 이메일 인증 체크(로그인 시)
exports.login_check_emaliauth = async (req, res, next) => {
  const { user } = res.locals;
  const { emailAuth } = req.body;
  const text = await userService.login_check_emaliauth(user);

  if (emailAuth === text) {
    await userService.login_delet_check_emaliauth(user);
    res.status(200).send({
      result: true,
    });
    return;
  }

  res.status(400).send({
    result: false,
  });
};

// 비밀번호 변경(로그인 시)
exports.login_change_password = async (req, res, next) => {
  const { user } = res.locals;
  const { password } = req.body;

  await userService.login_change_password(user, password);

  res.status(200).send({
    result: true,
  });
};
