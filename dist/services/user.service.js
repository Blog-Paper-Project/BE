const sequelize = require('sequelize');
const Bcrypt = require('bcrypt');
const { Op } = sequelize;
const { deleteImg } = require('../modules/multer');
const { User, Point } = require('../../models');

// 회원가입
exports.signup = async (email, nickname, password, blogId) => {
  const duplicate = await User.findAll({
    where: { [Op.or]: { nickname, blogId } },
  });

  // blogId || 닉네임 중복 체크
  if (duplicate.length) {
    return false;
  }

  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.update({ nickname, password: pwhash, blogId }, { where: { email } });
};
// 소셜 회원가입
exports.social_signup = async (blogId, nickname, email) => {
  const duplicate = await User.findAll({
    where: { email },
    attributes: ['nickname', 'blogId', 'provider'],
  });

  // 블로그 Id중복 체크 || 닉네임 중복 체크 || 로컬 회원 가입된 경우
  if (
    duplicate[0]?.dataValues.nickname === nickname &&
    duplicate[0]?.dataValues.blogId === blogId &&
    duplicate[0]?.dataValues.provider === 'local'
  ) {
    return false;
  }
  await User.update({ blogId, nickname }, { where: { email } });
};

// 회원탈퇴
exports.userDelete = async (user, deletedAt) => {
  return await User.update({ deletedAt }, { where: { userId: user.userId } });
};

// 회원복구
exports.user_restore = async (email, deletedAt) => {
  return await User.update({ deletedAt }, { where: { email } });
};

// 로그인
exports.login = async (email, session) => {
  //await User.update({ snsId: session }, { where: { email } });

  return await User.findOne({
    attributes: [
      'nickname',
      'password',
      'userId',
      'email',
      'deletedAt',
      'profileImage',
      'blogId',
      'snsId',
    ],
    where: { email },
  });
};

// 블로그 아이디 중복검사
exports.blogcheck = async (blogId) => {
  return await User.findOne({ attributes: ['blogId'], where: { blogId } });
};

// 이메일 || 닉네임 중복검사
exports.duplicate = async (id) => {
  const emailcheck = await User.findAll({
    where: { email: id },
    attributes: ['blogId', 'nickname'],
  });
  if (
    emailcheck[0]?.dataValues.blogId === null &&
    emailcheck[0]?.dataValues.nickname === null
  ) {
    await User.destroy({ where: { email: id } });
  }

  return await User.findAll({
    where: {
      [Op.or]: {
        email: id,
        nickname: id,
      },
    },
  });
};

// 마이 프로필 조회
exports.myprofile = async (user) => {
  return await User.findOne({
    where: { userId: user.userId },
    attributes: { exclude: ['password', 'email'] },
  });
};

// 마이 프로필 수정
exports.myprofile_correction = async (user, profileImage, nickname, introduction) => {
  if (nickname) {
    const duplicate = await User.findAll({
      where: { nickname },
      attributes: ['nickname'],
    });

    // 닉네임 중복 체크
    if (duplicate[0]?.dataValues.nickname === nickname) {
      return false;
    }
  }

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

// 이메일 인증
exports.emailauth = async (email, emailAuth) => {
  const emailcheck = await User.findOne({ where: { email } });
  if (!emailcheck) {
    await User.create({ email });
  }
  await User.update({ emailAuth }, { where: { email } });
};

// 이메일 인증 체크
exports.check_emaliauth = async (emailAuth) => {
  return await User.findOne({
    where: { emailAuth },
    attributes: ['emailAuth'],
  });
};

// 이메일 인증 삭제
exports.delet_check_emaliauth = async (emailAuth) => {
  await User.update({ emailAuth: null }, { where: { emailAuth } });
};

// 비밀번호 변경
exports.change_password = async (email, password) => {
  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.update({ password: pwhash }, { where: { email } });
};

// 이메일 인증 (로그인 시)
exports.login_emailauth = async (user, emailAuth) => {
  await User.update({ emailAuth }, { where: { userId: user.userId } });
};

// 이메일 인증 체크 (로그인 시)
exports.login_check_emaliauth = async (user) => {
  return await User.findOne({
    where: { userId: user.userId },
    attributes: ['emailAuth'],
  });
};

// 이메일 인증 삭제
exports.login_delet_check_emaliauth = async (user) => {
  await User.update({ emailAuth: null }, { where: { userId: user.userId } });
};

// 비밀번호 변경 (로그인 시)
exports.login_change_password = async (user, password) => {
  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.update({ password: pwhash }, { where: { userId: user.userId } });
};
