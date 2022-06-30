const sequelize = require('sequelize');
const Bcrypt = require('bcrypt');
const { Op } = sequelize;
const { deleteImg } = require('../modules/multer');
const { User } = require('../../models');

// 회원가입
const signup = async (email, nickname, password) => {
  const duplicate = await User.findAll({
    where: { [Op.or]: { email, nickname } },
  });
  // 이메일 || 닉네임 중복 체크
  if (duplicate.length) {
    return false;
  }

  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.create({ email, nickname, password: pwhash });
};
exports.signup = signup;

// 회원탈퇴
const userDelete = async (user) => {
  console.log(user);
  return await User.destroy({
    where: { userId: user.userId },
  });
};
exports.userDelete = userDelete;

// 로그인
const login = async (email) => {
  return await User.findOne({
    attributes: ['nickname', 'password', 'userId', 'email'],
    where: { email },
  });
};
exports.login = login;

// 이메일 || 닉네임 중복검사
const duplicate = async (id) => {
  return await User.findAll({
    where: {
      [Op.or]: {
        email: { [Op.like]: `%${id}%` },
        nickname: { [Op.like]: `%${id}%` },
      },
    },
  });
};
exports.duplicate = duplicate;

// 마이 프로필 조회
const myprofile = async (user) => {
  return await User.findOne({
    where: { userId: user.userId },
    attributes: { exclude: ['password'] },
  });
};
exports.myprofile = myprofile;

// 마이 프로필 수정
const myprofile_correction = async (user, profileImage, nickname, introduction) => {
  await deleteImg(user.profileImage);

  await User.update(
    { profileImage, nickname, introduction },
    { where: { userId: user.userId } }
  );

  return await User.findOne({
    where: { userId: user.userId },
    attributes: { exclude: ['password'] },
  });
};
exports.myprofile_correction = myprofile_correction;

// 이메일 인증
const emailauth = async (user, emailAuth) => {
  await User.update({ emailAuth }, { where: { userId: user.userId } });
};
exports.emailauth = emailauth;

// 이메일 인증 체크
const check_emaliauth = async (user) => {
  return await User.findOne({
    where: { userId: user.userId },
    attributes: ['emailAuth'],
  });
};
exports.check_emaliauth = check_emaliauth;

// 비밀번호 변경
const change_password = async (user, password) => {
  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.update({ password: pwhash }, { where: { userId: user.userId } });
};
exports.change_password = change_password;
