const Bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const userService = require('../services/user.service');
const passport = require('passport');
const Validatorsinup = require('../middleware/signup.validator');
const Validatorlogin = require('../middleware/login.validator');

require('dotenv').config();

// 카카오 로그인
const kakaoCallback = (req, res, next) => {
  passport.authenticate('kakao', { failureRedirect: '/' }, (err, user, info) => {
    if (err) return next(err);

    const { nickname } = user;
    const { userId } = user;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY);

    result = {
      token,
      nickname,
    };
    console.log('카카오 콜백 함수 결과', result);
    res.send({ user: result });
  })(req, res, next);
};
exports.kakaoCallback = kakaoCallback;

// 네이버 로그인
const naverCallback = (req, res, next) => {
  passport.authenticate('naver', { failureRedirect: '/' }, (err, user, info) => {
    if (err) return next(err);

    const nickname = user.email;
    const { userId } = user;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY);

    result = {
      token,
      nickname,
    };
    console.log('네이버 콜백 함수 결과', result);
    res.send({ user: result });
  })(req, res, next);
};
exports.naverCallback = naverCallback;

// 구글 로그인
const googleCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/' }, (err, user, info) => {
    if (err) return next(err);
    const { nickname } = user;
    const { userId } = user;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY);

    result = {
      token,
      nickname,
    };
    console.log('구글 콜백 함수 결과', result);
    res.send({ user: result });
  })(req, res, next);
};
exports.googleCallback = googleCallback;

//회원가입
const signup = async (req, res, next) => {
  try {
    const { email, nickname, password, confirmPassword } =
      await Validatorsinup.validateAsync(req.body);

    const rows = await userService.signup(email, nickname, password);
    if (rows === false) {
      return res.status(200).send({
        result: false,
      });
    } else {
      res.status(200).send({
        result: true,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.signup = signup;

// 회원탈퇴
const userDelete = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const deletedAt = new Date();
    await userService.userDelete(user, deletedAt);

    res.status(200).send({
      result: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.userDelete = userDelete;

// 회원복구
const user_restore = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const deletedAt = null;

    const user = await userService.login(email);
    const passwordck = await Bcrypt.compare(password, user.password);

    // 이메일이 틀리거나 패스워드가 틀렸을때
    if (!user || !passwordck) {
      return res.status(400).send({
        result: false,
      });
    }

    await userService.user_restore(email, deletedAt);
    res.status(200).send({
      result: true,
      msg: '회원복구 완료',
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.user_restore = user_restore;

// 로그인
const login = async (req, res, next) => {
  try {
    const { email, password } = await Validatorlogin.validateAsync(req.body);
    const user = await userService.login(email);
    const passwordck = await Bcrypt.compare(password, user.password);
    const exuser = user.deletedAt;
    console.log(exuser);

    // 탈퇴한 회원
    if (exuser) {
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
      token,
      userId: user.userId,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.login = login;

// 이메일 || 닉네임 중복검사
const duplicate = async (req, res, next) => {
  try {
    const id = req.body.email || req.body.nickname;
    const idcheck = await userService.duplicate(id);

    if (idcheck[0]?.email === id || idcheck[0]?.nickname === id) {
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
};
exports.duplicate = duplicate;

// 마이프로필 조회
const myprofile = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const myprofile = await userService.myprofile(user);

    res.status(200).send({
      myprofile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.myprofile = myprofile;

// 마이프로필 수정
const myprofile_correction = async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.myprofile_correction = myprofile_correction;

// 이메일 인증
const emailauth = async (req, res, next) => {
  try {
    const { email } = req.body;
    // 인증메일 (번호)
    const emailAuth = Math.floor(Math.random() * 10000);

    await userService.emailauth(email, emailAuth);

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
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.emailauth = emailauth;

// 이메일 인증 체크
const check_emaliauth = async (req, res, next) => {
  try {
    const { emailAuth } = req.body;
    const text = await userService.check_emaliauth(emailAuth);
    await userService.delet_check_emaliauth(emailAuth);
    console.log(text.emailAuth);
    if (Number(emailAuth) === text.emailAuth) {
      return res.status(200).send({
        result: true,
      });
    }

    res.status(400).send({
      result: false,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.check_emaliauth = check_emaliauth;

// 비밀번호 변경
const change_password = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    await userService.change_password(email, password);

    res.status(200).send({
      result: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.change_password = change_password;

// 이메일 인증 (로그인 시)
const login_emailauth = async (req, res, next) => {
  try {
    const { user } = res.locals;
    console.log(user.email);
    // 인증메일 (번호)
    const emailAuth = Math.floor(Math.random() * 10000);

    await userService.login_emailauth(user, emailAuth);

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
      to: user.email,
      subject: '[Paper] 인증번호가 도착했습니다.',
      text: `${emailAuth}`,
    });

    res.status(200).json({
      result: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.login_emailauth = login_emailauth;

// 이메일 인증 체크(로그인 시)
const login_check_emaliauth = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { emailAuth } = req.body;
    const text = await userService.login_check_emaliauth(user);
    await userService.login_delet_check_emaliauth(user);
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
};
exports.login_check_emaliauth = login_check_emaliauth;

// 비밀번호 변경(로그인 시)
const login_change_password = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { password } = req.body;

    await userService.login_change_password(user, password);

    res.status(200).send({
      result: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.login_change_password = login_change_password;
