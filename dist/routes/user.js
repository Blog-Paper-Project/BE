const express = require('express');
const sequelize = require('sequelize');
const { isNotLoggedIn } = require('../middleware/loging');
const signupmiddle = require('../middleware/joi-signup');
const loginmiddle = require('../middleware/joi-login');
const Authmiddle = require('../middleware/Auth');
const nodemailer = require('nodemailer');
const passport = require('passport');
const { upload, deleteImg } = require('../../dist/modules/multer');
const { User } = require('../../models');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Bcrypt = require('bcrypt');
const Op = sequelize.Op;
require('dotenv').config();

// 회원가입
router.post('/signup', isNotLoggedIn, async (req, res, next) => {
  try {
    const { email, nickname, password, confirmPassword } =
      await signupmiddle.validateAsync(req.body);

    // 이메일 || 닉네임 중복체크
    const userck = await User.findAll({
      where: { [Op.or]: { email, nickname } },
    });
    if (userck.length) {
      res.status(200).send({
        result: false,
      });
      return;
    }

    const salt = await Bcrypt.genSalt();
    const pwhash = await Bcrypt.hash(password, salt);

    await User.create({ email, nickname, password: pwhash });
    res.status(200).send({
      result: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 회원탈퇴
router.delete('/', Authmiddle, async (req, res, next) => {
  try {
    const { user } = res.locals;
    console.log(user);
    await User.destroy({
      where: { userId: user.userId },
    });
    res.status(200).send({
      result: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 카카오 로그인
router.get('/login/kakao', isNotLoggedIn, passport.authenticate('kakao'));

const kakaoCallback = (req, res, next) => {
  passport.authenticate(
    'kakao',
    { failureRedirect: '/' },
    (err, user, info) => {
      if (err) return next(err);
      console.log('콜백~~~');
      const userInfo = user;
      const { userId } = user;
      const token = jwt.sign({ userId }, process.env.SECRET_KEY);

      result = {
        token,
        userInfo,
      };
      console.log('카카오 콜백 함수 결과', result);
      res.send({ user: result });
    }
  )(req, res, next);
};

router.get('/login/kakao/callback', kakaoCallback);

// 네이버 로그인
router.get('/login/naver', isNotLoggedIn, passport.authenticate('naver'));

// 위에서 네이버 서버 로그인이 되면, 네이버 redirect url 설정에 따라 이쪽 라우터로 오게 된다.
const naverCallback = (req, res, next) => {
  passport.authenticate(
    'naver',
    { failureRedirect: '/' },
    (err, user, info) => {
      if (err) return next(err);
      console.log('콜백~~~');
      const userInfo = user;
      const { userId } = user;
      const token = jwt.sign({ userId }, process.env.SECRET_KEY);

      result = {
        token,
        userInfo,
      };
      console.log('네이버 콜백 함수 결과', result);
      res.send({ user: result });
    }
  )(req, res, next);
};

router.get('/login/naver/callback', naverCallback);

//구글 로그인 버튼 클릭시 구글 페이지로 이동하는 역할
router.get(
  '/login/google',
  isNotLoggedIn,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

//구글 로그인 후 자신의 웹사이트로 돌아오게될 주소 (콜백 url)
const googleCallback = (req, res, next) => {
  passport.authenticate(
    'google',
    { failureRedirect: '/' },
    (err, user, info) => {
      if (err) return next(err);
      const userInfo = user.email;
      const { userId } = user;
      const token = jwt.sign({ userId }, process.env.SECRET_KEY);

      result = {
        token,
        userInfo,
      };
      console.log('네이버 콜백 함수 결과', result);
      res.send({ user: result });
    }
  )(req, res, next);
};

router.get('/login/google/callback', googleCallback);

// 로그인
router.post('/login', isNotLoggedIn, async (req, res, next) => {
  try {
    const { email, password } = await loginmiddle.validateAsync(req.body);
    const user = await User.findOne({
      where: { email },
    });
    const passwordck = Bcrypt.compare(password, user.password);
    // 이메일이 틀리거나 패스워드가 틀렸을때
    if (!user || !passwordck) {
      res.status(400).send({
        result: false,
      });
      return;
    }
    const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, {
      expiresIn: 60 * 60 * 3, //60초 * 60분 * 3시 이므로, 3시간 유효한 토큰 발급
    });
    res.status(200).send({
      result: true,
      nickname: user.nickname,
      token,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 이메일 || 닉네임 중복검사
router.post('/idcheck/:id', isNotLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const idcheck = await User.findAll({
      where: {
        [Op.or]: {
          email: { [Op.like]: `%${id}%` },
          nickname: { [Op.like]: `%${id}%` },
        },
      },
    });
    if (idcheck.length) {
      res.status(400).send({
        result: false,
      });
      return;
    }
    res.status(200).send({
      result: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 마이프로필 조회
router.get('/myprofile', Authmiddle, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const myprofile = await User.findOne({
      where: { userId: user.userId },
      attributes: { exclude: ['password'] },
    });
    res.status(200).send({
      myprofile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 마이프로필 수정
router.patch(
  '/myprofile',
  Authmiddle,
  upload.single('image'),
  async (req, res, next) => {
    try {
      const { user } = res.locals;
      const profileImage = req.file.key;
      const { nickname, introduction } = req.body;

      await deleteImg(user.profileImage);

      await User.update(
        { profileImage, nickname, introduction },
        { where: { userId: user.userId } }
      );
      const profileimg = await User.findOne({
        where: { userId: user.userId },
        attributes: { exclude: ['password'] },
      });
      res.status(200).send({
        profileimg,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// 이메일 인증
router.post('/emailauth', Authmiddle, async (req, res, next) => {
  const { user } = res.locals;
  const { email } = req.body;
  // 인증메일 (번호)
  const emailAuth = Math.floor(Math.random() * 10000);
  await User.update({ emailAuth }, { where: { userId: user.userId } });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
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
});

// 이메일 인증 체크
router.post('/check-emailauth', Authmiddle, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { emailAuth } = req.body;
    const text = await User.findOne({
      where: { userId: user.userId },
      attributes: ['emailAuth'],
    });
    if (Number(emailAuth) === text.emailAuth) {
      res.status(200).send({
        result: true,
      });
      return;
    }
    res.status(400).send({
      result: false,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 사용자 비밀번호 재설정
router.patch('/change-password', Authmiddle, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { password } = req.body;

    const salt = await Bcrypt.genSalt();
    const pwhash = await Bcrypt.hash(password, salt);

    await User.update({ password: pwhash }, { where: { userId: user.userId } });
    res.status(200).send({
      result: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
