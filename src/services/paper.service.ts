import { Op, Sequelize } from 'sequelize';
import { deleteImg } from '../modules/multer';
import { calcDays, calcMs } from '../modules/date';
import deleteImgUrl from '../modules/contents_preview';

const { Paper, User, Comment, Image, Tag } = require('../../models');
const { redisCli } = require('../../app');

// 키워드로 게시글 검색
export const findPostsBy = async (keyword: string) => {
  const papers: Models.Paper[] = (
    await Paper.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { contents: { [Op.like]: `%${keyword}%` } },
        ],
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'Users', attributes: ['blogId', 'nickname', 'profileImage'] },
        { model: User, as: 'Likes', attributes: ['blogId'] },
      ],
    })
  ).map(deleteImgUrl);

  return papers;
};

// 인기도 순으로 유저 12명 검색
export const findBestUsers = async () => {
  const users = await User.findAll({
    order: [['popularity', 'DESC']],
    limit: 12,
    attributes: ['userId', 'blogId', 'nickname', 'introduction', 'profileImage'],
  });

  const bottom = [...users.splice(3, 3), ...users.splice(6, 3)];

  return [...users, ...bottom];
};

// 레디스에 저장된 메인 페이지 데이터 검색
export const findCachePosts = async () => {
  const papers = await redisCli.v4.get('main');

  return JSON.parse(papers);
};

// 1주일간 좋아요 순으로 게시글 12개 검색 후 레디스에 저장
export const findBestPosts = async () => {
  const papers: DTO.PaperLike[] = await Paper.findAll({
    include: [
      { model: User, as: 'Users', attributes: ['blogId', 'nickname', 'profileImage'] },
      { model: User, as: 'Likes' },
    ],
  });
  const papersByLike = papers
    .map((paper) => {
      const { postId, title, contents, thumbnail, createdAt, Likes, Users } = paper;
      const likes = Likes.filter((like) => like.createdAt > calcDays(7)).length;
      const { blogId, nickname, profileImage } = Users;

      return {
        postId,
        blogId,
        nickname,
        profileImage,
        title,
        contents,
        thumbnail,
        likes,
        createdAt,
      };
    })
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 12)
    .map(deleteImgUrl) as DTO.PaperByLike[];

  await redisCli.set('main', JSON.stringify(papersByLike), 'EX', 600);

  return papersByLike;
};

// 전체 게시글 검색
export const findAllPosts = async () => {
  const papers: DTO.PaperLike[] = (
    await Paper.findAll({
      attributes: ['postId', 'title', 'contents', 'thumbnail', 'viewCount', 'createdAt'],
      include: [
        { model: User, as: 'Users', attributes: ['blogId', 'nickname', 'profileImage'] },
        { model: User, as: 'Likes', attributes: ['blogId'] },
      ],
      order: [['createdAt', 'DESC']],
    })
  ).map(deleteImgUrl);

  return papers;
};

// 특정 유저와 게시글 검색
export const findUserInfo = async (blogId: string) => {
  const user: DTO.UserInfo = await User.findOne({
    where: { blogId },
    attributes: ['blogId', 'nickname', 'profileImage', 'introduction', 'popularity'],
    include: [
      { model: Paper, include: { model: Tag, attributes: ['name'] } },
      { model: User, as: 'Followers', attributes: ['blogId'] },
    ],
    order: [[Paper, 'createdAt', 'DESC']],
  });

  let categories = user?.Papers.map((paper) => paper.category);
  let tags = user?.Papers.flatMap((paper) => paper.Tags).map((tag) => tag.name);

  categories = [...new Set(categories)];
  tags = [...new Set(tags)];

  return { user, categories, tags };
};

// 카테고리 검색
export const findCategories = async (userId: string) => {
  const papers: Models.Paper[] = await Paper.findAll({
    where: { userId },
    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']],
  });
  const categories = papers.map((paper) => paper.category);

  return categories;
};

// 개인 페이지 카테고리 수정
export const updateCategory = async (
  userId: number,
  category: string,
  newCategory: string
) => {
  const paper = await Paper.update(
    { category: newCategory },
    { where: { userId, category } }
  );

  return paper;
};

// 특정 유저와 모든 구독 검색
export const findMiniInfo = async (userId: number) => {
  const user = await User.findOne({
    where: { userId },
    attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
    include: { model: User, as: 'Followers', attributes: ['userId'] },
  });

  return user;
};

// 특정 유저 검색
export const findUser = async (blogId: string) => {
  const user = await User.findOne({ where: { blogId } });

  return user;
};

// 구독 중인 최신 게시글 검색
export const findNewPosts = async (userId: number) => {
  const user: DTO.MyFeed = await User.findOne({
    where: { userId },
    include: {
      model: User,
      as: 'Followees',
      include: { model: Paper, attributes: ['postId', 'title', 'createdAt', 'userId'] },
    },
  });
  const posts = user.Followees.flatMap((followee) => followee.Papers)
    .filter((paper) => paper.createdAt > calcDays(3))
    .sort((a, b) => calcMs(b.createdAt) - calcMs(a.createdAt));

  return posts;
};

// 특정 게시글 검색
export const findPost = async (postId: string) => {
  const paper = await Paper.findOne({ where: { postId } });

  return paper;
};

// 특정 게시글과 유저, 댓글, 좋아요 검색
export const findPostInfo = async (postId: string) => {
  const paper = await Paper.findOne({
    where: { postId },
    include: [
      {
        model: Comment,
        include: {
          model: User,
          as: 'Users',
          attributes: ['userId', 'blogId', 'nickname', 'profileImage'],
        },
      },
      { model: Tag, attributes: ['name'] },
      { model: User, as: 'Users', attributes: ['blogId', 'nickname', 'profileImage'] },
      { model: User, as: 'Likes', attributes: ['blogId'] },
    ],
  });

  return paper;
};

// 조회수 증가 및 검색
export const addCount = async (postId: string, userId: string) => {
  await redisCli.sadd(postId, userId);

  const count = await redisCli.v4.sCard(postId);

  return count;
};

// 게시글 작성
export const createPost = async (
  title: string,
  contents: string,
  thumbnail: string,
  userId: number,
  category: string
) => {
  const paper = await Paper.create({ title, contents, thumbnail, category, userId });

  return paper;
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

// 미사용 이미지 삭제 & 추가 이미지 게시글 번호 등록
export const updateImage = async (postId: number, images: string[]) => {
  const originalImages: Models.Image[] = await Image.findAll({
    where: { postId },
    raw: true,
  });

  if (originalImages.length) {
    const replaced = originalImages.filter((img) => !images.includes(img.url));

    await Promise.all(
      replaced.map(async (image) => {
        await deleteImg(image.url);
        await Image.destroy({ where: { imageId: image.imageId } });
      })
    );
  }

  const image = await Image.update(
    { postId },
    { where: { url: { [Op.in]: images } } },
    { updateOnDuplicate: true }
  );

  return image;
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
  const paper = await Paper.update(
    { title, contents, thumbnail, category },
    { where: { userId, postId } }
  );

  return paper;
};

// 태그 수정
export const updateTags = async (postId: string, tags: string[]) => {
  await Tag.destroy({ where: { postId } });

  const updatedTags = await createTags(postId, tags);

  return updatedTags;
};

// 게시글과 이미지 삭제
export const destroyPost = async (userId: number, postId: string) => {
  const images: Models.Image[] = await Image.findAll(
    { where: { postId } },
    { raw: true }
  );
  const paper = await Paper.findOne({ where: { userId, postId } });

  await Promise.all(images.map(async (image) => deleteImg(image.url)));
  await deleteImg(paper?.thumbnail);
  await redisCli.del(postId);

  if (paper) {
    const deleted = await paper.destroy();

    return deleted;
  }

  return paper;
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
  const comment = await Comment.update(
    { text },
    { where: { commentId, userId, postId } }
  );

  return comment;
};

// 댓글 삭제
export const destroyComment = async (
  commentId: string,
  userId: number,
  postId: string
) => {
  const deleted = await Comment.destroy({ where: { userId, commentId, postId } });

  return deleted;
};
