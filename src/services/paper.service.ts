/* eslint-disable */
const { Op } = require('sequelize');
const { Paper, User, Comment, Image, Tag } = require('../../models');
const { deleteImg } = require('../modules/multer');

// 키워드로 게시글 검색
export const findPostsBy = async (keyword: string) => {
  return await Paper.findAll({
    where: { title: { [Op.like]: `%${keyword}%` } },
    order: [['createdAt', 'DESC']],
  });
};

// 모든 게시글과 좋아요 검색
export const findAllPosts = async () => {
  return await Paper.findAll({ include: { model: User, as: 'Likes' } });
};

// 인기도 순으로 유저 10명 검색
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

// 특정 유저와 모든 구독 검색
export const findMiniInfo = async (userId: number) => {
  return await User.findOne({
    where: { userId },
    attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
    include: { model: User, as: 'Followers', attributes: ['userId'] },
  });
};

// 특정 유저와 게시글 검색
export const findUserInfo = async (userId: string) => {
  return await User.findOne({
    where: { userId },
    attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
    include: { model: Paper },
    order: [[Paper, 'createdAt', 'DESC']],
  });
};

// 특정 게시글 검색
export const findPost = async (postId: string) => {
  return await Paper.findOne({ where: { postId } });
};

// 특정 게시글과 유저, 댓글, 좋아요 검색
export const findPostInfo = async (postId: string) => {
  return await Paper.findOne({
    where: { postId },
    include: [
      { model: Comment },
      { model: User, as: 'Users', attributes: ['nickname', 'profileImage'] },
      { model: User, as: 'Likes' },
    ],
  });
};

// 게시글 작성
export const createPost = async (
  title: string,
  contents: string,
  thumbnail: string,
  userId: number,
  category: string
) => {
  return await Paper.create({ title, contents, thumbnail, category, userId });
};

// 태그 추가
export const createTags = async (postId: string, tags: string[]) => {
  if (!tags || !tags.length) {
    return;
  }

  const items = tags.map((tag) => {
    return { postId, name: tag };
  });

  await Tag.bulkCreate(items);
};

// 미사용 이미지 삭제 & 추가 이미지 게시글 번호 등록
export const updateImage = async (postId: number, images: string[]) => {
  const originalImages = await Image.findAll({ where: { postId }, raw: true });
  if (originalImages.length) {
    const replaced = originalImages.filter(
      (img: { url: string }) => !images.includes(img.url)
    );

    for (let item of replaced) {
      await deleteImg(item.url);
      await Image.destroy({ where: { imageId: item.imageId } });
    }
  }

  return await Image.update(
    { postId: postId },
    { where: { url: { [Op.in]: images } } },
    { updateOnDuplicate: true }
  );
};

// 글 작성 포인트 지급
export const updatePoint = async (userId: number) => {
  await User.increment({ point: +1 }, { where: { userId } });
};

// 이미지 생성
export const createImage = async (url: string) => {
  await Image.create({ url });
};

// 게시글 수정
export const updatePost = async (
  title: string,
  contents: string,
  thumbnail: string,
  userId: number,
  postId: string,
  category: string
) => {
  return await Paper.update(
    { title, contents, thumbnail, category },
    { where: { userId, postId } }
  );
};

// 태그 수정
export const updateTags = async (postId: string, tags: string[]) => {
  await Tag.destroy({ where: { postId } });

  return await createTags(postId, tags);
};

// 게시글과 이미지 삭제
export const destroyPost = async (userId: number, postId: string) => {
  const images = await Image.findAll({ where: { postId } }, { raw: true });
  const paper = await Paper.findOne({ where: { userId, postId } });

  for (let image of images) {
    await deleteImg(image.url);
  }

  await deleteImg(paper.thumbnail);

  return await paper.destroy();
};

// 댓글 작성
export const createComment = async (text: string, userId: number, postId: string) => {
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
