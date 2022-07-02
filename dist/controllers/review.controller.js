const custom_error_1 = require('../modules/custom_error');
const reviewService = require('../services/review.service');

// 리뷰 작성
const postReview = async (req, res, next) => {
  try {
    const userId = res.locals.user.userId;
    const revieweeId = Number(req.params.userId);
    const { review, rate } = req.body;
    if (userId === revieweeId) {
      return next((0, custom_error_1.createError)(400, '본인 리뷰 불가'));
    }
    const newReview = await reviewService.createReview(userId, revieweeId, review, rate);

    res.status(200).json({ review: newReview });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.postReview = postReview;

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
exports.readReview = readReview;
