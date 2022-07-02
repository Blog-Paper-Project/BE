"use strict";
const express = require("express");
const paperController = require("../controllers/paper.controller");
// eslint-disable-next-line
const auth = require('../middleware/auth');
const { upload } = require('../modules/multer');
const router = express.Router();
// 메인 페이지 조회 & 게시글 검색
router.get('/', paperController.readMain);
// 개인 페이지 조회
router.get('/users/:userId', paperController.readBlog);
// 미니 프로필 조회
router.get('/miniprofile', auth, paperController.readMiniProfile);
// 상세 페이지 조회
router.get('/users/:userId/:postId', paperController.readPost);
// 상세 페이지 작성
router.post('/', auth, paperController.createPost);
// 상세 페이지 이미지 첨부
router.post('/image', auth, upload.single('image'), paperController.createImage);
// 상세 페이지 수정
router.patch('/:postId', auth, paperController.updatePost);
// 상세 페이지 삭제
router.delete('/:postId', auth, paperController.deletePost);
// 댓글 작성
router.post('/:postId/comments', auth, paperController.createComment);
// 댓글 수정
router.patch('/:postId/comments/:commentId', auth, paperController.updateComment);
// 댓글 삭제
router.delete('/:postId/comments/:commentId', auth, paperController.deleteComment);
// 좋아요 등록 및 취소
router.post('/:postId/likes', auth, paperController.createLike);
// 구독 등록 및 취소
router.post('/users/:userId/subscription', auth, paperController.createSubs);
module.exports = router;
