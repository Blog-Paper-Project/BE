"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyComment = exports.updateComment = exports.createComment = exports.destroyPost = exports.updateTags = exports.updatePost = exports.createImage = exports.updatePoint = exports.updateImage = exports.createTags = exports.createPost = exports.findPostInfo = exports.findPost = exports.updateCategory = exports.findUserInfo = exports.findMiniInfo = exports.findUser = exports.findBestUsers = exports.findAllPosts = exports.findPostsBy = void 0;
/* eslint-disable */
const { Op } = require('sequelize');
const { Paper, User, Comment, Image, Tag } = require('../../models');
const { deleteImg } = require('../modules/multer');
const { calcOneWeek } = require('../modules/date');
// 키워드로 게시글 검색
const findPostsBy = async (keyword) => {
    return await Paper.findAll({
        where: {
            [Op.or]: [
                { title: { [Op.like]: `%${keyword}%` } },
                { contents: { [Op.like]: `%${keyword}%` } },
            ],
        },
        order: [['createdAt', 'DESC']],
    });
};
exports.findPostsBy = findPostsBy;
// 1주일간 좋아요 순으로 게시글 11개 검색
const findAllPosts = async () => {
    const papers = await Paper.findAll({
        limit: 11,
        include: { model: User, as: 'Likes' },
    });
    const papersByLike = papers
        .map((paper) => {
        const { postId, userId, title, thumbnail, Likes } = paper;
        const likes = Likes.filter((like) => new Date(like.createdAt) > calcOneWeek()).length;
        return { postId, userId, title, thumbnail, likes };
    })
        .sort((a, b) => b.likes - a.likes);
    return papersByLike;
};
exports.findAllPosts = findAllPosts;
// 인기도 순으로 유저 18명 검색
const findBestUsers = async () => {
    return await User.findAll({
        order: [['popularity', 'DESC']],
        limit: 18,
        attributes: ['userId', 'nickname', 'profileImage', 'popularity'],
    });
};
exports.findBestUsers = findBestUsers;
// 특정 유저 검색
const findUser = async (userId) => {
    return await User.findOne({ where: { userId } });
};
exports.findUser = findUser;
// 특정 유저와 모든 구독 검색
const findMiniInfo = async (userId) => {
    return await User.findOne({
        where: { userId },
        attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
        include: { model: User, as: 'Followers', attributes: ['userId'] },
    });
};
exports.findMiniInfo = findMiniInfo;
// 특정 유저와 게시글 검색
const findUserInfo = async (userId) => {
    const user = await User.findOne({
        where: { userId },
        attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
        include: {
            model: Paper,
            include: { model: Tag, attributes: ['name'] },
        },
        order: [[Paper, 'createdAt', 'DESC']],
    });
    let categories = user?.Papers.map((paper) => paper.category);
    let tags = user?.Papers.map((paper) => paper.Tags)
        .flat()
        .map((tag) => tag.name);
    categories = [...new Set(categories)];
    tags = [...new Set(tags)];
    return [user, categories, tags];
};
exports.findUserInfo = findUserInfo;
// 개인 페이지 카테고리 수정
const updateCategory = async (userId, category, newCategory) => {
    return await Paper.update({ category: newCategory }, { where: { userId, category } });
};
exports.updateCategory = updateCategory;
// 특정 게시글 검색
const findPost = async (postId) => {
    return await Paper.findOne({ where: { postId } });
};
exports.findPost = findPost;
// 특정 게시글과 유저, 댓글, 좋아요 검색
const findPostInfo = async (postId) => {
    return await Paper.findOne({
        where: { postId },
        include: [
            { model: Comment },
            { model: Tag, attributes: ['name'] },
            { model: User, as: 'Users', attributes: ['nickname', 'profileImage'] },
            { model: User, as: 'Likes' },
        ],
    });
};
exports.findPostInfo = findPostInfo;
// 게시글 작성
const createPost = async (title, contents, thumbnail, userId, category) => {
    return await Paper.create({ title, contents, thumbnail, category, userId });
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
// 미사용 이미지 삭제 & 추가 이미지 게시글 번호 등록
const updateImage = async (postId, images) => {
    const originalImages = await Image.findAll({ where: { postId }, raw: true });
    if (originalImages.length) {
        const replaced = originalImages.filter((img) => !images.includes(img.url));
        for (let item of replaced) {
            await deleteImg(item.url);
            await Image.destroy({ where: { imageId: item.imageId } });
        }
    }
    return await Image.update({ postId: postId }, { where: { url: { [Op.in]: images } } }, { updateOnDuplicate: true });
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
    return await Paper.update({ title, contents, thumbnail, category }, { where: { userId, postId } });
};
exports.updatePost = updatePost;
// 태그 수정
const updateTags = async (postId, tags) => {
    await Tag.destroy({ where: { postId } });
    return await (0, exports.createTags)(postId, tags);
};
exports.updateTags = updateTags;
// 게시글과 이미지 삭제
const destroyPost = async (userId, postId) => {
    const images = await Image.findAll({ where: { postId } }, { raw: true });
    const paper = await Paper.findOne({ where: { userId, postId } });
    for (let image of images) {
        await deleteImg(image.url);
    }
    await deleteImg(paper.thumbnail);
    return await paper.destroy();
};
exports.destroyPost = destroyPost;
// 댓글 작성
const createComment = async (text, userId, postId) => {
    return await Comment.create({
        text,
        userId,
        postId: +postId,
    });
};
exports.createComment = createComment;
// 댓글 수정
const updateComment = async (text, commentId, userId, postId) => {
    return await Comment.update({ text }, { where: { commentId, userId, postId } });
};
exports.updateComment = updateComment;
// 댓글 삭제
const destroyComment = async (commentId, userId, postId) => {
    return await Comment.destroy({ where: { userId, commentId, postId } });
};
exports.destroyComment = destroyComment;
