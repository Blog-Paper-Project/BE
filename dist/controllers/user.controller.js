const sequelize = require('sequelize');
const Bcrypt = require('bcrypt');
const { Op } = sequelize;
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { deleteImg } = require('../modules/multer');
const nodemailer = require('nodemailer');
const { User } = require('../../models');
const Validatorsinup = require('../middleware/signup.validator');
const Validatorlogin = require('../middleware/login.validator');

// 카카오
const kakaoCallback = (req, res, next) => {
  passport.authenticate('kakao', { failureRedirect: '/' }, (err, user, info) => {
    if (err) return next(err);
    console.log('콜백~~~');
    const userInfo = user.nickname;
    const { userId } = user;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY);

    result = {
      token,
      userInfo,
    };
    console.log('카카오 콜백 함수 결과', result);
    res.send({ user: result });
  })(req, res, next);
};
exports.kakaoCallback = kakaoCallback;

// 네이버
const naverCallback = (req, res, next) => {
  passport.authenticate('naver', { failureRedirect: '/' }, (err, user, info) => {
    if (err) return next(err);
    console.log('콜백~~~');
    const userInfo = user.email;
    const { userId } = user;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY);

    result = {
      token,
      userInfo,
    };
    console.log('네이버 콜백 함수 결과', result);
    res.send({ user: result });
  })(req, res, next);
};
exports.naverCallback = naverCallback;

//구글 로그인 후 자신의 웹사이트로 돌아오게될 주소 (콜백 url)
const googleCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/' }, (err, user, info) => {
    if (err) return next(err);
    const userInfo = user.nickname;
    const { userId } = user;
    const token = jwt.sign({ userId }, process.env.SECRET_KEY);

    result = {
      token,
      userInfo,
    };
    console.log('네이버 콜백 함수 결과', result);
    res.send({ user: result });
  })(req, res, next);
};
exports.googleCallback = googleCallback;

//회원가입
const signup = async (req, res, next) => {
  try {
    const { email, nickname, password, confirmPassword } =
      await Validatorsinup.validateAsync(req.body);

    // 이메일 || 닉네임 중복체크
    const duplicate = await User.findAll({
      where: { [Op.or]: { email, nickname } },
    });

    const userche = await User.findAll({
      where: { email },
    });
    console.log(userche);
    if (duplicate.length) {
      res.status(200).send({
        result: false,
      });
      return;
    }
    // 게정복구 아직 미정!!
    // else if (userche) {
    //   await User.restore({
    //     where: { email },
    //     parnoid : false // 일시삭제 검색가능
    //   });
    //   return res.status(200).send({
    //     result2: true,
    //   });
    // }
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
};
exports.signup = signup;

// 회원탈퇴
const userDelete = async (req, res, next) => {
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
};
exports.userDelete = userDelete;

// 로그인
const login = async (req, res, next) => {
  try {
    const { email, password } = await Validatorlogin.validateAsync(req.body);
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
};
exports.login = login;

// 이메일 || 닉네임 중복검사
const duplicate = async (req, res, next) => {
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
};
exports.duplicate = duplicate;

// 마이프로필 조회
const myprofile = async (req, res, next) => {
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
};
exports.myprofile = myprofile;

// 마이프로필 수정
const myprofile_correction = async (req, res, next) => {
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
};
exports.myprofile_correction = myprofile_correction;

// 이메일 인증
const emailauth = async (req, res, next) => {
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
};
exports.emailauth = emailauth;

// 이메일 인증 체크
const check_emaliauth = async (req, res, next) => {
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
};
exports.check_emaliauth = check_emaliauth;

// 비밀번호 변경
const change_password = async (req, res, next) => {
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
};
exports.change_password = change_password;
