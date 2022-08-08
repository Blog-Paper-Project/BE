"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyComment = exports.updateComment = exports.createComment = exports.destroyPost = exports.updateTags = exports.updatePost = exports.createImage = exports.updatePoint = exports.updateImage = exports.createTags = exports.createPost = exports.addCount = exports.findPostInfo = exports.findPost = exports.findNewPosts = exports.findUser = exports.findMiniInfo = exports.updateCategory = exports.findCategories = exports.findUserInfo = exports.findAllPosts = exports.findBestPosts = exports.findCachePosts = exports.findBestUsers = exports.findPostsBy = void 0;
const sequelize_1 = require("sequelize");
const multer_1 = require("../modules/multer");
const date_1 = require("../modules/date");
const contents_preview_1 = require("../modules/contents_preview");
const { Paper, User, Comment, Image, Tag } = require('../../models');
const { redisCli } = require('../../app');
// 키워드로 게시글 검색
const findPostsBy = async (keyword) => {
    const papers = (await Paper.findAll({
        where: {
            [sequelize_1.Op.or]: [
                { title: { [sequelize_1.Op.like]: `%${keyword}%` } },
                { contents: { [sequelize_1.Op.like]: `%${keyword}%` } },
            ],
        },
        order: [['createdAt', 'DESC']],
        include: [
            { model: User, as: 'Users', attributes: ['blogId', 'nickname', 'profileImage'] },
            { model: User, as: 'Likes', attributes: ['blogId'] },
        ],
    })).map(contents_preview_1.default);
    return papers;
};
exports.findPostsBy = findPostsBy;
// 인기도 순으로 유저 12명 검색
const findBestUsers = async () => {
    const users = await User.findAll({
        order: [['popularity', 'DESC']],
        limit: 12,
        attributes: ['userId', 'blogId', 'nickname', 'introduction', 'profileImage'],
    });
    const bottom = [...users.splice(3, 3), ...users.splice(6, 3)];
    return [...users, ...bottom];
};
exports.findBestUsers = findBestUsers;
// 레디스에 저장된 메인 페이지 데이터 검색
const findCachePosts = async () => {
    const papers = await redisCli.v4.get('main');
    return JSON.parse(papers);
};
exports.findCachePosts = findCachePosts;
// 1주일간 좋아요 순으로 게시글 7개 검색 후 레디스에 저장
const findBestPosts = async () => {
    const papers = await Paper.findAll({
        include: [
            { model: User, as: 'Users', attributes: ['blogId', 'nickname', 'profileImage'] },
            { model: User, as: 'Likes' },
        ],
    });
    const papersByLike = papers
        .map((paper) => {
        const { postId, title, contents, thumbnail, createdAt, Likes, Users } = paper;
        const likes = Likes.filter((like) => like.createdAt > (0, date_1.calcDays)(7)).length;
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
        .slice(0, 7)
        .map(contents_preview_1.default);
    await redisCli.set('main', JSON.stringify(papersByLike), 'EX', 600);
    return papersByLike;
};
exports.findBestPosts = findBestPosts;
// 전체 게시글 검색
const findAllPosts = async () => {
    const papers = (await Paper.findAll({
        include: [
            { model: User, as: 'Users', attributes: ['blogId', 'nickname', 'profileImage'] },
            { model: User, as: 'Likes', attributes: ['blogId'] },
        ],
        order: [['createdAt', 'DESC']],
    })).map(contents_preview_1.default);
    return papers;
};
exports.findAllPosts = findAllPosts;
// 특정 유저와 게시글 검색
const findUserInfo = async (blogId) => {
    const user = await User.findOne({
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
exports.findUserInfo = findUserInfo;
// 카테고리 검색
const findCategories = async (userId) => {
    const papers = await Paper.findAll({
        where: { userId },
        attributes: [[sequelize_1.Sequelize.fn('DISTINCT', sequelize_1.Sequelize.col('category')), 'category']],
    });
    const categories = papers.map((paper) => paper.category);
    return categories;
};
exports.findCategories = findCategories;
// 개인 페이지 카테고리 수정
const updateCategory = async (userId, category, newCategory) => {
    const paper = await Paper.update({ category: newCategory }, { where: { userId, category } });
    return paper;
};
exports.updateCategory = updateCategory;
// 특정 유저와 모든 구독 검색
const findMiniInfo = async (userId) => {
    const user = await User.findOne({
        where: { userId },
        attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
        include: { model: User, as: 'Followers', attributes: ['userId'] },
    });
    return user;
};
exports.findMiniInfo = findMiniInfo;
// 특정 유저 검색
const findUser = async (blogId) => {
    const user = await User.findOne({ where: { blogId } });
    return user;
};
exports.findUser = findUser;
// 구독 중인 최신 게시글 검색
const findNewPosts = async (userId) => {
    const user = await User.findOne({
        where: { userId },
        include: {
            model: User,
            as: 'Followees',
            include: { model: Paper, attributes: ['postId', 'title', 'createdAt', 'userId'] },
        },
    });
    const posts = user.Followees.flatMap((followee) => followee.Papers)
        .filter((paper) => paper.createdAt > (0, date_1.calcDays)(3))
        .sort((a, b) => (0, date_1.calcMs)(b.createdAt) - (0, date_1.calcMs)(a.createdAt));
    return posts;
};
exports.findNewPosts = findNewPosts;
// 특정 게시글 검색
const findPost = async (postId) => {
    const paper = await Paper.findOne({ where: { postId } });
    return paper;
};
exports.findPost = findPost;
// 특정 게시글과 유저, 댓글, 좋아요 검색
const findPostInfo = async (postId) => {
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
exports.findPostInfo = findPostInfo;
// 조회수 증가 및 검색
const addCount = async (postId, userId) => {
    await redisCli.sadd(postId, userId);
    const count = await redisCli.v4.sCard(postId);
    return count;
};
exports.addCount = addCount;
// 게시글 작성
const createPost = async (title, contents, thumbnail, userId, category) => {
    const paper = await Paper.create({ title, contents, thumbnail, category, userId });
    return paper;
};
exports.createPost = createPost;
// 태그 추가
const createTags = async (postId, tags) => {
    if (!tags || !tags.length) {
        return;
    }
    const items = tags.map((tag) => {
        return { postId, name: tag };
    });
    await Tag.bulkCreate(items);
};
exports.createTags = createTags;
// 미사용 이미지 삭제 & 추가 이미지 게시글 번호 등록
const updateImage = async (postId, images) => {
    const originalImages = await Image.findAll({
        where: { postId },
        raw: true,
    });
    if (originalImages.length) {
        const replaced = originalImages.filter((img) => !images.includes(img.url));
        await Promise.all(replaced.map(async (image) => {
            await (0, multer_1.deleteImg)(image.url);
            await Image.destroy({ where: { imageId: image.imageId } });
        }));
    }
    const image = await Image.update({ postId }, { where: { url: { [sequelize_1.Op.in]: images } } }, { updateOnDuplicate: true });
    return image;
};
exports.updateImage = updateImage;
// 글 작성 포인트 지급
const updatePoint = async (userId) => {
    await User.increment({ point: +1 }, { where: { userId } });
};
exports.updatePoint = updatePoint;
// 이미지 생성
const createImage = async (url) => {
    await Image.create({ url });
};
exports.createImage = createImage;
// 게시글 수정
const updatePost = async (title, contents, thumbnail, userId, postId, category) => {
    const paper = await Paper.update({ title, contents, thumbnail, category }, { where: { userId, postId } });
    return paper;
};
exports.updatePost = updatePost;
// 태그 수정
const updateTags = async (postId, tags) => {
    await Tag.destroy({ where: { postId } });
    const updatedTags = await (0, exports.createTags)(postId, tags);
    return updatedTags;
};
exports.updateTags = updateTags;
// 게시글과 이미지 삭제
const destroyPost = async (userId, postId) => {
    const images = await Image.findAll({ where: { postId } }, { raw: true });
    const paper = await Paper.findOne({ where: { userId, postId } });
    await Promise.all(images.map(async (image) => (0, multer_1.deleteImg)(image.url)));
    await (0, multer_1.deleteImg)(paper?.thumbnail);
    await redisCli.del(postId);
    if (paper) {
        const deleted = await paper.destroy();
        return deleted;
    }
    return paper;
};
exports.destroyPost = destroyPost;
// 댓글 작성
const createComment = async (text, userId, postId) => {
    return (await Comment.create({
        text,
        userId,
        postId: +postId,
    }));
};
exports.createComment = createComment;
// 댓글 수정
const updateComment = async (text, commentId, userId, postId) => {
    const comment = await Comment.update({ text }, { where: { commentId, userId, postId } });
    return comment;
};
exports.updateComment = updateComment;
// 댓글 삭제
const destroyComment = async (commentId, userId, postId) => {
    const deleted = await Comment.destroy({ where: { userId, commentId, postId } });
    return deleted;
};
exports.destroyComment = destroyComment;
