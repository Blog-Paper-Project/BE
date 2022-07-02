const express = require('express');
const auth = require('../middleware/auth');
const reviewController = require('../controllers/review.controller');
const router = express.Router();

// 리뷰 작성
router.post('/:userId', auth, reviewController.postReview);

// 리뷰 조회
router.get('/:userId', reviewController.readReview);

module.exports = router;
