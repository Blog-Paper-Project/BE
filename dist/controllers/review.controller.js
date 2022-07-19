const createError = require('../modules/custom_error');
const reviewService = require('../services/review.service');

// 리뷰 작성
const postReview = async (req, res, next) => {
  try {
    const userId = res.locals.user.userId;
    const revieweeId = Number(req.params.userId);
    const { review, rate } = req.body;
    if (userId === revieweeId) {
      return next(createError(400, '본인 리뷰 불가'));
    }
    const newReview = await reviewService.createReview(userId, revieweeId, review, rate);

    res.status(200).json({ review: newReview });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 리뷰 조회
const readReview = async (req, res, next) => {
  try {
    const revieweeId = Number(req.params.userId);
    let review = await reviewService.readReview(revieweeId);
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
};

// 리뷰 수정
const updateReview = async (req, res, next) => {
  try {
    const userId = res.locals.user.userId;
    const { reviewId } = req.params;
    const { review, rate } = req.body;
    const { reviewerId } = await reviewService.reviewById(reviewId);
    if (reviewerId !== userId) {
      return next(createError(400, '본인이 작성한 리뷰만 수정 가능합니다.'));
    }
    const updateReview = await reviewService.updateReview(userId, reviewId, review, rate);
    res.status(200).json({ review: updateReview });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = { postReview, readReview, updateReview };
