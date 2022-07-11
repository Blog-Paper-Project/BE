import * as express from 'express';
import * as PaperController from '../controllers/paper.controller';
// eslint-disable-next-line
const auth = require('../middleware/auth');
const { upload } = require('../modules/multer');

const router = express.Router();

// 메인 페이지 조회 & 게시글 검색
router.get('/', PaperController.readMain);

// 개인 페이지 조회
router.get('/users/:userId', PaperController.readBlog);

// 개인 페이지 카테고리 수정
router.patch('/users/:userId/categories/:category', auth, PaperController.updateCategory);

// 미니 프로필 조회
router.get('/miniprofile', auth, PaperController.readMiniProfile);

// 상세 페이지 조회
router.get('/users/:userId/:postId', PaperController.readPost);

// 상세 페이지 작성
router.post('/', auth, PaperController.createPost);

// 상세 페이지 이미지 첨부
router.post('/image', auth, upload.single('image'), PaperController.createImage);

// 상세 페이지 수정
router.patch('/:postId', auth, PaperController.updatePost);

// 상세 페이지 삭제
router.delete('/:postId', auth, PaperController.deletePost);

// 댓글 작성
router.post('/:postId/comments', auth, PaperController.createComment);

// 댓글 수정
router.patch('/:postId/comments/:commentId', auth, PaperController.updateComment);

// 댓글 삭제
router.delete('/:postId/comments/:commentId', auth, PaperController.deleteComment);

// 좋아요 등록 및 취소
router.post('/:postId/likes', auth, PaperController.createLike);

// 구독 등록 및 취소
router.post('/users/:userId/subscription', auth, PaperController.createSubs);

export = router;
