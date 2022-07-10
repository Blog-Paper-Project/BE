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
const userDelete = async (user, deletedAt) => {
  return await User.update({ deletedAt }, { where: { userId: user.userId } });
};
exports.userDelete = userDelete;

// 회원복구
const user_restore = async (email, deletedAt) => {
  return await User.update({ deletedAt }, { where: { email } });
};
exports.user_restore = user_restore;

// 로그인
const login = async (email) => {
  return await User.findOne({
    attributes: ['nickname', 'password', 'userId', 'email', 'deletedAt'],
    where: { email },
  });
};
exports.login = login;

// refresh_token 저장
const refresh_token = async (email, refreshToken) => {
  await User.update({ refreshToken }, { where: { email } });
};
exports.refresh_token = refresh_token;

// refresh_token 으로 아이디 찾기
const refresh_token_check = async (refreshToken) => {
  return User.findOne({
    attributes: ['userId'],
    where: { refreshToken },
  });
};
exports.refresh_token_check = refresh_token_check;

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
    attributes: { exclude: ['password', 'refresh_token'] },
  });
};
exports.myprofile = myprofile;

// 마이 프로필 수정
const myprofile_correction = async (user, profileImage, nickname, introduction) => {
  const duplicate = await User.findAll({
    where: { nickname },
  });

  // 닉네임 중복 체크
  if (duplicate.length) {
    return false;
  }

  await deleteImg(user.profileImage);

  await User.update(
    { profileImage, nickname, introduction },
    { where: { userId: user.userId } }
  );

  return await User.findOne({
    where: { userId: user.userId },
    attributes: { exclude: ['password', 'refresh_token'] },
  });
};
exports.myprofile_correction = myprofile_correction;

// 이메일 인증
const emailauth = async (email, emailAuth) => {
  await User.update({ emailAuth, email }, { where: { email } });
};
exports.emailauth = emailauth;

// 이메일 인증 체크
const check_emaliauth = async (emailAuth) => {
  return await User.findOne({
    where: { emailAuth },
    attributes: ['emailAuth'],
  });
};
exports.check_emaliauth = check_emaliauth;

// 이메일 인증 삭제
const delet_check_emaliauth = async (emailAuth) => {
  await User.update({ emailAuth: null }, { where: { emailAuth } });
};
exports.delet_check_emaliauth = delet_check_emaliauth;

// 비밀번호 변경
const change_password = async (email, password) => {
  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.update({ password: pwhash }, { where: { email } });
};
exports.change_password = change_password;

// 이메일 인증 (로그인 시)
const login_emailauth = async (user, emailAuth) => {
  await User.update({ emailAuth }, { where: { userId: user.userId } });
};
exports.login_emailauth = login_emailauth;

// 이메일 인증 체크 (로그인 시)
const login_check_emaliauth = async (user) => {
  return await User.findOne({
    where: { userId: user.userId },
    attributes: ['emailAuth'],
  });
};
exports.login_check_emaliauth = login_check_emaliauth;

// 이메일 인증 삭제
const login_delet_check_emaliauth = async (user) => {
  await User.update({ emailAuth: null }, { where: { userId: user.userId } });
};
exports.login_delet_check_emaliauth = login_delet_check_emaliauth;

// 비밀번호 변경 (로그인 시)
const login_change_password = async (user, password) => {
  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.update({ password: pwhash }, { where: { userId: user.userId } });
};
exports.login_change_password = login_change_password;
