const sequelize = require('sequelize');
const Bcrypt = require('bcrypt');
const { Op } = sequelize;
const { deleteImg } = require('../modules/multer');
const { User } = require('../../models');
const jwt = require('jsonwebtoken');
const { redisCli } = require('../../app');

const redisCliv4 = redisCli.v4;

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

  await User.create({ email, nickname, password: pwhash, blogId });
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
exports.user_restore = async (email) => {
  const user = await User.findOne({
    attributes: ['email', 'password'],
    where: { email },
  });
  if (user === null) {
    return false;
  }
  await User.update({ deletedAt: null }, { where: { email } });
  return user;
};

// 로그인
exports.login = async (email) => {
  const user = await User.findOne({
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
  if (user === null) {
    return user;
  }

  const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, {
    expiresIn: 60 * 60 * 3, //60초 * 60분 * 3시 이므로, 3시간 유효한 토큰 발급
  });

  const tokencheck = await redisCliv4.get(email);
  await redisCli.setex(email, 10800, token); // true: 1 , false: 0

  // if (tokencheck !== token && tokencheck !== null) {
  //   return false;
  // }

  return [user, token];
};

// 로그아웃
exports.logout = async (user) => {
  const userout = await redisCliv4.exists(user.email); // true: 1 , false: 0
  if (userout) await redisCli.del(user.email);
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
    attributes: { exclude: ['password'] },
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
exports.emailauth = async (parmas, emailAuth) => {
  const emailcheck = await redisCliv4.get(parmas);

  if (!emailcheck) {
    return await redisCli.setex(parmas, 300, emailAuth);
  }

  await redisCli.setex(parmas, 300, emailAuth);
};

// 이메일 인증 체크
exports.check_emaliauth = async (email) => {
  return await redisCliv4.get(email);
};

// 이메일 인증 삭제
exports.delet_check_emaliauth = async (email) => {
  const emailcheck = await redisCliv4.exists(email); // true: 1 , false: 0
  if (emailcheck) await redisCli.del(email);
};

// 비밀번호 변경
exports.change_password = async (email, password) => {
  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.update({ password: pwhash }, { where: { email } });
};

// 이메일 인증 (로그인 시)
exports.login_emailauth = async (user, emailAuth) => {
  const emailcheck = await redisCliv4.get('login' + user.email);

  if (!emailcheck) {
    return await redisCli.setex('login' + user.email, 300, emailAuth);
  }

  await redisCli.setex('login' + user.email, 300, emailAuth);
};

// 이메일 인증 체크 (로그인 시)
exports.login_check_emaliauth = async (user) => {
  return await redisCliv4.get('login' + user.email);
};

// 이메일 인증 삭제
exports.login_delet_check_emaliauth = async (user) => {
  const emailcheck = await redisCliv4.exists('login' + user.dataValues.email); // true: 1 , false: 0
  if (emailcheck) await redisCli.del('login' + user.dataValues.email);
};

// 비밀번호 변경 (로그인 시)
exports.login_change_password = async (user, password) => {
  const salt = await Bcrypt.genSalt();
  const pwhash = await Bcrypt.hash(password, salt);

  await User.update({ password: pwhash }, { where: { userId: user.userId } });
};
