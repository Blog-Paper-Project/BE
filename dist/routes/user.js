const express = require('express');
const sequelize = require('sequelize');
const signupmiddle = require('../middleware/joi-signup');
const loginmiddle = require('../middleware/joi-login');
const Authmiddle = require('../middleware/Auth');
const { upload, deleteImg } = require('../../dist/modules/multer');
const { User } = require('../../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = express.Router();
const Bcrypt = require('bcrypt');
const Op = sequelize.Op;

// 회원가입
router.post('/signup', async (req, res, next) => {
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

// 로그인
router.post('/login', async (req, res, next) => {
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
    console.log(user.Id);
    res.status(200).send({
      result: true,
      nickname: user.nickname,
      token: jwt.sign({ userId: user.userId }, process.env.SECRET_KEY),
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 이메일 || 닉네임 중복검사
router.get('/idcheck/:id', async (req, res, next) => {
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
    console.log(idcheck);
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

router.post('/user/emailauth', async (req, res, next) => {});

module.exports = router;
