const sequelize = require('sequelize');
const Bcrypt = require('bcrypt');
const { Op } = sequelize;
const { deleteImg } = require('../modules/multer');
const { User, Point } = require('../../models');

// 회원가입
exports.signup = async (email, nickname, password, blogId) => {
  const duplicate = await User.findAll({
    where: { [Op.or]: { email, nickname, blogId } },
  });
  // 이메일 || 닉네임 중복 체크
  if (duplicate.length) {
    return false;
  }

  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.create({ email, nickname, password: pwhash, blogId });
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
  // await User.update({ snsId: session }, { where: { email } });

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
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Point,
        attributes: ['setPoint'],
      },
    ],
  });
};

// 마이 프로필 수정
exports.myprofile_correction = async (user, profileImage, nickname, introduction) => {
  if (nickname) {
    const duplicate = await User.findAll({
      where: { nickname },
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
exports.emailauth = async (emailAuth) => {
  await User.create({ emailAuth });
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
  await User.destroy({ where: { emailAuth } });
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
