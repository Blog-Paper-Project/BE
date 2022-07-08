const { User, Review } = require('../../models');

// 리뷰 작성
const createReview = async (userId, revieweeId, review, rate) => {
  return await Review.create({
    reviewerId: userId,
    revieweeId,
    review,
    rate,
  });
};
exports.createReview = createReview;

// 리뷰 조회
const readReview = async (revieweeId) => {
  return await Review.findAll({
    where: { revieweeId },
    order: [['createdAt', 'DESC']],
    attributes: ['review', 'rate'],
    include: { model: User, as: 'Reviewer', attributes: ['nickname'] },
  });
};
exports.readReview = readReview;
