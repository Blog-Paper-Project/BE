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

// 리뷰 조회
const readReview = async (revieweeId) => {
  return await Review.findAll({
    where: { revieweeId },
    order: [['createdAt', 'DESC']],
    attributes: ['review', 'rate', 'createdAt'],
    include: { model: User, as: 'Reviewer', attributes: ['nickname'] },
  });
};

// 리뷰 수정
const updateReview = async (reviewId, review, rate) => {
  return await Review.update({ review, rate }, { where: { reviewId } });
};

// 리뷰 아이디 조회
const reviewById = async (reviewId) => {
  return await Review.findOne({ where: { reviewId } });
};

// 리뷰 삭제
const deleteReview = async (reviewId) => {
  return await Review.destroy({ where: { reviewId } });
};

module.exports = { createReview, readReview, updateReview, reviewById, deleteReview };
