const express = require('express');
const auth = require('../middleware/auth');
const custom_error_1 = require('../modules/custom_error');
const { Review, User } = require('../../models');
const router = express.Router();

// 리뷰 작성
router.post('/:userId', auth, async (req, res, next) => {
  try {
    const userId = res.locals.user.userId;
    const revieweeId = Number(req.params.userId);
    const { review, rate } = req.body;
    if (userId === revieweeId) {
      return next((0, custom_error_1.createError)(400, '본인 리뷰 불가'));
    }
    const newReview = await Review.create({
      reviewerId: userId,
      revieweeId,
      review,
      rate,
    });

    res.status(200).json({ review: newReview });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 리뷰 조회
router.get('/:userId', async (req, res, next) => {
  try {
    const revieweeId = Number(req.params.userId);
    let review = await Review.findAll({
      where: { revieweeId },
      order: [['createdAt', 'DESC']],
      attributes: ['review', 'rate'],
      include: { model: User, as: 'Reviewer', attributes: ['nickname'] },
    });
    review = review.map((r) => {
      let { review, rate, Reviewer } = r;
      Reviewer = Reviewer.nickname;
      let reviewer = Reviewer;
      return { review, rate, reviewer };
    });

    res.status(200).json({ review });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
