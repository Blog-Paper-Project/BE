/* eslint-disable */
const { Op } = require('sequelize');
const { Paper, User, Comment, Image } = require('../../models');
const { deleteImg } = require('../modules/multer');

// 키워드로 게시글 검색
export const findPostsBy = async (keyword: string) => {
  return await Paper.findAll({
    where: { title: { [Op.like]: `%${keyword}%` } },
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

// 특정 유저 검색
export const findUser = async (userId: string) => {
  return await User.findOne({ where: { userId } });
};

// 특정 유저 정보와 관련 구독 내역 검색
export const findMiniInfo = async (userId: number) => {
  return await User.findOne({
    where: { userId },
    attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
    include: { model: User, as: 'Followers', attributes: ['userId'] },
  });
};

// 특정 유저 정보와 관련 게시글 검색
export const findUserInfo = async (userId: string) => {
  return await User.findOne({
    where: { userId },
    attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
    include: { model: Paper, attributes: ['postId', 'title', 'contents', 'createdAt'] },
    order: [[Paper, 'createdAt', 'DESC']],
  });
};

// 특정 게시글 검색
export const findPost = async (postId: string) => {
  return await Paper.findOne({ where: { postId } });
};

// 특정 게시글 정보와 관련 유저, 댓글 검색
export const findPostInfo = async (postId: string) => {
  return await Paper.findOne({
    where: { postId },
    include: [
      { model: Comment },
      { model: User, as: 'Users', attributes: ['nickname', 'profileImage'] },
    ],
  });
};

// 게시글 작성
export const createPost = async (
  title: string,
  contents: string,
  thumbnail: string,
  userId: number
) => {
  return await Paper.create({ title, contents, thumbnail, userId });
};

// 이미지 & 썸네일 게시글 번호 등록
export const updateImage = async (postId: number, images: string[]) => {
  const originalImages = await Image.findAll({ where: { postId }, raw: true });
  if (originalImages.length) {
    const replaced = originalImages.filter(
      (img: { imageUrl: string }) => !images.includes(img.imageUrl)
    );

    for (let item of replaced) {
      await deleteImg(item.imageUrl);
      await Image.destroy({ where: { imageId: item.imageId } });
    }
  }

  return await Image.update(
    { postId: postId },
    { where: { imageUrl: { [Op.in]: images } } },
    { updateOnDuplicate: true }
  );
};

// 포인트 지급
export const updatePoint = async (userId: number) => {
  await User.increment({ point: +1 }, { where: { userId } });
};

// 이미지 생성
export const createImage = async (imageUrl: string) => {
  await Image.create({ imageUrl });
};

// 게시글 수정
export const updatePost = async (
  title: string,
  contents: string,
  thumbnail: string,
  userId: string,
  postId: string
) => {
  return await Paper.update(
    { title, contents, thumbnail },
    { where: { userId, postId } }
  );
};

// 게시글 & 썸네일 & 이미지 삭제
export const destroyPost = async (userId: number, postId: string) => {
  const images = await Image.findAll({ where: { postId } }, { raw: true });
  const paper = await Paper.findOne({ where: { userId, postId } });

  for (let image of images) {
    await deleteImg(image.imageUrl);
  }

  await deleteImg(paper.thumbnail);

  return await paper.destroy();
};

// 댓글 작성
export const createComment = async (text: string, userId: string, postId: string) => {
  return await Comment.create({
    text,
    userId,
    postId: +postId,
  });
};

// 댓글 수정
export const updateComment = async (
  text: string,
  commentId: string,
  userId: number,
  postId: string
) => {
  return await Comment.update({ text }, { where: { commentId, userId, postId } });
};

// 댓글 삭제
export const destroyComment = async (
  commentId: string,
  userId: number,
  postId: string
) => {
  return await Comment.destroy({ where: { userId, commentId, postId } });
};
