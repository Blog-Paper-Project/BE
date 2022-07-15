/* eslint-disable */
const { Op } = require('sequelize');
const { Paper, User, Comment, Image, Tag } = require('../../models');
const { deleteImg } = require('../modules/multer');

import calcOneWeek from '../modules/date';

// 키워드로 게시글 검색
export const findPostsBy = async (keyword: string) => {
  return (await Paper.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${keyword}%` } },
        { contents: { [Op.like]: `%${keyword}%` } },
      ],
    },
    order: [['createdAt', 'DESC']],
  })) as Models.Paper;
};

// 1주일간 좋아요 순으로 게시글 11개 검색
export const findAllPosts = async () => {
  const papers: DTO.PaperLike[] = await Paper.findAll({
    include: { model: User, as: 'Likes' },
  });
  const papersByLike = papers
    .map((paper) => {
      const { postId, userId, title, contents, thumbnail, Likes } = paper;
      const likes = Likes.filter(
        (like) => new Date(like.createdAt) > calcOneWeek()
      ).length;

      return { postId, userId, title, contents, thumbnail, likes };
    })
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 11);

  const papersWithNoImg = papersByLike.map((paper) => {
    paper.contents = paper.contents.replace(
      /!\[(.){0,50}\]\(https:\/\/hanghae-mini-project.s3.ap-northeast-2.amazonaws.com\/[0-9]{13}.[a-z]{3,4}\)/g,
      ''
    );
    return paper;
  });

  return papersWithNoImg;
};

// 인기도 순으로 유저 18명 검색
export const findBestUsers = async () => {
  return await User.findAll({
    order: [['popularity', 'DESC']],
    limit: 18,
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
  const user = (await User.findOne({
    where: { userId },
    attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
    include: {
      model: Paper,
      include: { model: Tag, attributes: ['name'] },
    },
    order: [[Paper, 'createdAt', 'DESC']],
  })) as DTO.UserInfo;

  let categories = user?.Papers.map((paper) => paper.category);
  let tags = user?.Papers.flatMap((paper) => paper.Tags).map((tag) => tag.name);

  categories = [...new Set(categories)];
  tags = [...new Set(tags)];

  return [user, categories, tags];
};

// 개인 페이지 카테고리 수정
export const updateCategory = async (
  userId: string,
  category: string,
  newCategory: string
) => {
  return await Paper.update({ category: newCategory }, { where: { userId, category } });
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
      { model: Tag, attributes: ['name'] },
      { model: User, as: 'Users', attributes: ['nickname', 'profileImage'] },
      { model: User, as: 'Likes', attributes: ['nickname'] },
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
  const originalImages: Models.Image[] = await Image.findAll({
    where: { postId },
    raw: true,
  });
  if (originalImages.length) {
    const replaced = originalImages.filter((img) => !images.includes(img.url));

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

  await deleteImg(paper?.thumbnail);

  return await paper.destroy();
};

// 댓글 작성
export const createComment = async (text: string, userId: number, postId: string) => {
  return (await Comment.create({
    text,
    userId,
    postId: +postId,
  })) as Models.Comment;
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
