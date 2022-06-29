const { Paper, User, Comment } = require('../../models');
import { Op } from 'sequelize';

// 키워드를 포함한 게시글 검색
export const findBestPosts = async (keyword: string) => {
  return await Paper.findAll({
    where: { title: { [Op.like]: `%${keyword || ''}%` } },
    order: [['createdAt', 'DESC']],
  });
};

// 좋아요 정보를 포함한 모든 게시글 검색
export const findAllPosts = async () => {
  return await Paper.findAll({ include: { model: User, as: 'Likes' } });
};

// 인기도 순으로 유저 정렬 및 검색
export const findBestUsers = async () => {
  return await User.findAll({
    order: [['popularity', 'DESC']],
    limit: 10,
    attributes: ['userId', 'nickname', 'profileImage', 'popularity'],
  });
};

export const findUserPosts = async (userId: string) => {
  return await Paper.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
};

export const findUser = async (userId: string) => {
  return await User.findOne({
    where: { userId },
    attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
  });
};

export const findUserPost = async (postId: string, userId?: string) => {
  return userId
    ? await Paper.findOne({ where: { postId, userId } })
    : await Paper.findOne({ where: { postId } });
};

export const createPost = async (title: string, contents: string, userId: number) => {
  return await Paper.create({ title, contents, userId });
};

export const updatePost = async (
  title: string,
  contents: string,
  userId: string,
  postId: string
) => {
  return await Paper.update({ title, contents }, { where: { userId, postId } });
};

export const destroyPost = async (userId: number, postId: string) => {
  console.log(userId, postId);
  return await Paper.destroy({ where: { userId, postId } });
};

export const createComment = async (comment: string, userId: string, postId: string) => {
  return await Comment.create({
    comment,
    userId,
    postId: +postId,
  });
};

export const updateComment = async (
  comment: string,
  commentId: string,
  userId: number,
  postId: string
) => {
  return await Comment.update({ comment }, { where: { commentId, userId, postId } });
};

export const destroyComment = async (
  commentId: string,
  userId: number,
  postId: string
) => {
  return await Comment.destroy({ where: { userId, commentId, postId } });
};
