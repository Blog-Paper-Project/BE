const passport = require('passport');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const userService = require('../services/user.service');
require('dotenv').config();

class User {
  constructor(social) {
    this.social = social;
  }
  socials(res) {
    return passport.authenticate(this.social, (err, user) => {
      if (err) return next(err);
      const { nickname, userId, profileImage, blogId, email } = user;
      const token = jwt.sign({ userId }, process.env.SECRET_KEY);

      res.status(200).json({
        result: true,
        token,
        nickname,
        userId,
        profileImage,
        blogId,
        email,
      });
    });
  }

  async emailAuth(params) {
    // 인증메일 (번호)
    const emailAuth = Math.floor(Math.random() * 10000);

    await userService.emailauth(params, emailAuth);

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
      to: params,
      subject: '[Paper] 인증번호가 도착했습니다.',
      text: `${emailAuth}`,
    });
  }
}
module.exports = User;
