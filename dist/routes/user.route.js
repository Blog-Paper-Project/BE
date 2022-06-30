const express = require('express');
const { isNotLoggedIn } = require('../middleware/loging');
const Authmiddle = require('../middleware/auth');
const { upload } = require('../modules/multer');
const passport = require('passport');
const router = express.Router();
const Usercontroller = require('../controllers/user.controller');

require('dotenv').config();

// 카카오 로그인
router.get('/login/kakao', isNotLoggedIn, passport.authenticate('kakao'));

router.get('/login/kakao/callback', Usercontroller.kakaoCallback);

// 네이버 로그인
router.get('/login/naver', isNotLoggedIn, passport.authenticate('naver'));

router.get('/login/naver/callback', Usercontroller.naverCallback);

//구글 로그인 버튼 클릭시 구글 페이지로 이동하는 역할
router.get(
  '/login/google',
  isNotLoggedIn,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/login/google/callback', Usercontroller.googleCallback);

// 회원가입
router.post('/signup', Usercontroller.signup);

// 회원탈퇴
router.delete('/', Authmiddle, Usercontroller.userDelete);

// 로그인
router.post('/login', Usercontroller.login);

// 이메일 || 닉네임 중복검사
router.post('/idcheck/:id', isNotLoggedIn, Usercontroller.duplicate);

// 마이프로필 조회
router.get('/myprofile', Authmiddle, Usercontroller.myprofile);

// 마이프로필 수정
router.patch(
  '/myprofile',
  Authmiddle,
  upload.single('image'),
  Usercontroller.myprofile_correction
);

// 이메일 인증
router.post('/emailauth', Authmiddle, Usercontroller.emailauth);

// 이메일 인증 체크
router.post('/check-emailauth', Authmiddle, Usercontroller.check_emaliauth);

// 사용자 비밀번호 재설정
router.patch('/change-password', Authmiddle, Usercontroller.change_password);

module.exports = router;
