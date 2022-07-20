const reviewService = require('../services/review.service');

// 리뷰 작성
const postReview = async (req, res, next) => {
  try {
    const user = res.locals.user;
    const revieweeId = req.params.blogId;
    const { review, rate } = req.body;
    if (user.blogId === revieweeId) {
      return res.status(400).json({ result: false });
    }
    const newReview = await reviewService.createReview(
      user.userId,
      revieweeId,
      review,
      rate
    );

    res.status(200).json({ review: newReview });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 리뷰 조회
const readReview = async (req, res, next) => {
  try {
    const revieweeId = req.params.blogId;
    let review = await reviewService.readReview(revieweeId);
    review = review.map((r) => {
      let { review, rate, Reviewer, createdAt } = r;
      Reviewer = Reviewer.nickname;
      let reviewer = Reviewer;
      return { review, rate, reviewer, createdAt };
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
      return res.status(400).json({ result: false });
    }
    await reviewService.updateReview(reviewId, review, rate);
    const updateReview = await reviewService.reviewById(reviewId);
    res.status(200).json({ review: updateReview });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = { postReview, readReview, updateReview };
