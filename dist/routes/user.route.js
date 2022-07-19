const express = require('express');
const { isNotLoggedIn } = require('../middleware/loging');
const Authmiddle = require('../middleware/auth');
const { upload } = require('../modules/multer');
const passport = require('passport');
const router = express.Router();
const Usercontroller = require('../controllers/user.controller');
const AsyncHandler = require('../middleware/async.handler');

require('dotenv').config();

// 카카오 로그인
router.get('/login/kakao', isNotLoggedIn, passport.authenticate('kakao'));

router.get('/login/kakao/callback', AsyncHandler(Usercontroller.kakaoCallback));

// 네이버 로그인
router.get('/login/naver', isNotLoggedIn, passport.authenticate('naver'));

router.get('/login/naver/callback', AsyncHandler(Usercontroller.naverCallback));

//구글 로그인
router.get(
  '/login/google',
  isNotLoggedIn,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/login/google/callback', AsyncHandler(Usercontroller.googleCallback));

// 회원가입
router.post('/signup', AsyncHandler(Usercontroller.signup));

// 회원탈퇴
router.patch('/', Authmiddle, AsyncHandler(Usercontroller.userDelete));

// 회원복구
router.patch('/restore', AsyncHandler(Usercontroller.user_restore));

// 로그인
router.post('/login', AsyncHandler(Usercontroller.login));

// 블로그 아이디 중복검사
router.post('/blogid', AsyncHandler(Usercontroller.blogcheck));

// 이메일 || 닉네임 중복검사
router.post('/idcheck', isNotLoggedIn, AsyncHandler(Usercontroller.duplicate));

// 마이프로필 조회
router.get('/myprofile', Authmiddle, AsyncHandler(Usercontroller.myprofile));

// 마이프로필 수정
router.patch(
  '/myprofile',
  Authmiddle,
  upload.single('image'),
  AsyncHandler(Usercontroller.myprofile_correction)
);

// 이메일 인증
router.post('/emailauth', AsyncHandler(Usercontroller.emailauth));

// 이메일 인증 체크
router.post('/check-emailauth', AsyncHandler(Usercontroller.check_emaliauth));

// 사용자 비밀번호 재설정
router.patch('/change-password', AsyncHandler(Usercontroller.change_password));

// 이메일 인증 (로그인 시)
router.post('/login/emailauth', Authmiddle, AsyncHandler(Usercontroller.login_emailauth));

// 이메일 인증 체크(로그인 시)
router.post(
  '/login/check-emailauth',
  Authmiddle,
  AsyncHandler(Usercontroller.login_check_emaliauth)
);

// 사용자 비밀번호 재설정(로그인 시)
router.patch(
  '/login/change-password',
  Authmiddle,
  AsyncHandler(Usercontroller.login_change_password)
);

module.exports = router;
