const Bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const User = require('../modules/user.class');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { signup_schma, login_schma } = require('../middlewares/user.validator');

require('dotenv').config();

// 카카오 로그인
exports.kakaoCallback = (req, res, next) => {
  // const user = new User('kakao');
  passport.authenticate('kakao', (err, user) => {
    if (err) return next(err);

    const { nickname, userId, profileImage, blogId, email } = user;
    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY);
    const ref_token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY);

    res.status(200).json({
      result: true,
      token,
      nickname,
      userId,
      profileImage,
      blogId,
      email,
    });
  })(req, res, next);
  // user.socials(res)(req, res, next);
};

// 네이버 로그인
exports.naverCallback = (req, res, next) => {
  // const user = new User('naver');
  passport.authenticate('naver', (err, user) => {
    if (err) return next(err);
    const { nickname, userId, profileImage, blogId, email } = user;

    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY);
    const ref_token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY);

    res.status(200).json({
      result: true,
      token,
      nickname,
      userId,
      profileImage,
      blogId,
      email,
    });
  })(req, res, next);
  // user.socials(res)(req, res, next);
};

// 구글 로그인
exports.googleCallback = (req, res, next) => {
  // const user = new User('google');
  passport.authenticate('google', (err, user) => {
    if (err) return next(err);
    const { nickname, userId, profileImage, blogId, email } = user;
    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY);
    const ref_token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY);

    res.status(200).json({
      result: true,
      token,
      nickname,
      userId,
      profileImage,
      blogId,
      email,
    });
  })(req, res, next);
  // user.socials(res)(req, res, next);
};

//회원가입
exports.signup = async (req, res, next) => {
  const { email, nickname, password, blogId } = await signup_schma.validateAsync(
    req.body
  );

  const duplicate = await userService.signup(email, nickname, password, blogId);
  duplicate === false
    ? res.status(400).send({
        result: false,
      })
    : res.status(200).send({
        result: true,
      });
};

// 소셜 회원가입
exports.social_signup = async (req, res, next) => {
  const { blogId, nickname, email } = req.body;

  const social_duplicate = await userService.social_signup(blogId, nickname, email);

  social_duplicate === false
    ? res.status(400).send({
        result: false,
      })
    : res.status(200).send({
        result: true,
      });
};

// 회원탈퇴
exports.userDelete = async (req, res, next) => {
  const { user } = res.locals;
  const deletedAt = new Date();
  await userService.userDelete(user, deletedAt);

  res.status(200).send({
    result: true,
  });
};

// 회원복구
exports.user_restore = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userService.user_restore(email);

  if (user === false)
    return res.status(400).send({
      result: false,
      msg: '이메일 또는 패스워드가 잘못됫습니다.',
    });

  const passwordck = await Bcrypt.compare(password, user.password);

  // 이메일이 틀리거나 패스워드가 틀렸을때
  !user || !passwordck
    ? res.status(400).send({
        result: false,
        msg: '이메일 또는 패스워드가 잘못됫습니다.',
      })
    : res.status(200).send({
        result: true,
        msg: '회원복구 완료',
      });
};

// 로그인
exports.login = async (req, res, next) => {
  const { email, password } = await login_schma.validateAsync(req.body);

  const user = await userService.login(email);
  console.log(user[1]);
  if (user === false)
    return res.status(400).send({
      result: false,
      logout: '다른 곳에서 로그인을 합니다.',
    });

  // 탈퇴한 회원
  if (user !== null && user[0]?.deletedAt)
    return res.status(400).send({
      result: false,
      msg: '탈퇴한 회원입니다',
    });

  if (user === null) {
    return res.status(400).send({
      result2: false,
      msg: '이메일 또는 패스워드가 잘못됫습니다.',
    });
  } else {
    const passwordck = await Bcrypt.compare(password, user[0].password);

    // 이메일이 틀리거나 패스워드가 틀렸을때
    if (!user || !passwordck)
      return res.status(400).send({
        result: false,
        msg: '이메일 또는 패스워드가 잘못됫습니다.',
      });
  }

  res.status(200).send({
    result: true,
    nickname: user[0].nickname,
    profileImage: user[0].profileImage,
    token: user[1],
    userId: user[0].userId,
    blogId: user[0].blogId,
  });
};
// refresh 토큰을 기반으로 access 토큰
exports.refresh = async (req, res, next) => {
  const { email, refreshToken } = req.body;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  const user = await userService.refresh_token_check(email, refreshToken);
  if (user === false) {
    return res.status(400).send({
      result: false,
      msg: '토큰값 만료되었슴니다.',
    });
  }

  const accessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: 10800,
  });

  res.status(200).send({
    accessToken,
  });
};

// 로그아웃
exports.logout = async (req, res, next) => {
  const { user } = res.locals;
  await userService.logout(user);
  res.status(200).send({
    result: true,
    message: '로그아웃',
  });
};

// 블로그 아이디 중복검사
exports.blogcheck = async (req, res, next) => {
  const { blogId } = req.body;

  const blogidch = await userService.blogcheck(blogId);

  blogidch
    ? res.status(400).send({
        result: false,
      })
    : res.status(200).send({
        result: true,
      });
};

// 이메일 || 닉네임 중복검사
exports.duplicate = async (req, res, next) => {
  const id = req.body.email || req.body.nickname;
  const idcheck = await userService.duplicate(id);

  idcheck[0]?.email === id || idcheck[0]?.nickname === id
    ? res.status(400).send({
        result: false,
      })
    : res.status(200).send({
        result: true,
      });
};

// 마이프로필 조회
exports.myprofile = async (req, res, next) => {
  const { user } = res.locals;
  const myprofile = await userService.myprofile(user);

  res.status(200).send({
    myprofile,
  });
};

// 마이프로필 수정
exports.myprofile_correction = async (req, res, next) => {
  const { user } = res.locals;
  const profileImage = req.file?.transforms[0].key;
  const { nickname, introduction } = req.body;

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

  profileimg === false
    ? res.status(400).send({
        result: false,
      })
    : res.status(200).send(profileimg);
};

// 이메일 인증
exports.emailauth = async (req, res, next) => {
  const { email } = req.body;

  const user = new User();
  user.emailAuth(email);

  res.status(200).json({
    result: true,
  });
};

// 이메일 인증 체크
exports.check_emaliauth = async (req, res, next) => {
  const { email, emailAuth } = req.body;

  const user = new User();
  const emailauth_check = await user.emailAuth_check(email, emailAuth);

  emailauth_check === true
    ? res.status(200).send({ result: true })
    : res.status(400).send({
        result: false,
      });
};

// 비밀번호 변경
exports.change_password = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send({
      result: false,
      msg: '비밀번호가 틀립니다',
    });
  }

  const users = new User();
  users.password_change(email, password);

  res.status(200).send({
    result: true,
  });
};

// 이메일 인증 (로그인 시)
exports.login_emailauth = async (req, res, next) => {
  const { user } = res.locals;

  const users = new User();
  users.emailAuth(user.email);

  res.status(200).json({
    result: true,
  });
};

// 이메일 인증 체크(로그인 시)
exports.login_check_emaliauth = async (req, res, next) => {
  const { user } = res.locals;
  const { emailAuth } = req.body;

  const users = new User();
  const emailauth_check = await users.emailAuth_check(user.email, emailAuth);

  emailauth_check === true
    ? res.status(200).send({ result: true })
    : res.status(400).send({
        result: false,
      });
};

// 비밀번호 변경(로그인 시)
exports.login_change_password = async (req, res, next) => {
  const { user } = res.locals;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send({
      result: false,
      msg: '비밀번호가 틀립니다',
    });
  }

  const users = new User();
  users.password_change(user.email, password);

  res.status(200).send({
    result: true,
  });
};
