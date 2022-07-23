const express = require('express');
const auth = require('../middleware/auth');
const reviewController = require('../controllers/review.controller');
const router = express.Router();

// 리뷰 작성
router.post('/:blogId', auth, reviewController.postReview);

// 리뷰 조회
router.get('/:blogId', reviewController.readReview);

// 리뷰 수정
router.put('/:reviewId', auth, reviewController.updateReview);

// 리뷰 삭제
router.delete('/:reviewId', auth, reviewController.deleteReview);

module.exports = router;
