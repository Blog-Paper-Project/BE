"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyComment = exports.updateComment = exports.createComment = exports.destroyPost = exports.updatePost = exports.createImage = exports.updatePoint = exports.updateImage = exports.createPost = exports.findPostInfo = exports.findPost = exports.findUserInfo = exports.findMiniInfo = exports.findUser = exports.findBestUsers = exports.findAllPosts = exports.findPostsBy = void 0;
/* eslint-disable */
const { Op } = require('sequelize');
const { Paper, User, Comment, Image } = require('../../models');
const { deleteImg } = require('../modules/multer');
// 키워드로 게시글 검색
const findPostsBy = async (keyword) => {
    return await Paper.findAll({
        where: { title: { [Op.like]: `%${keyword}%` } },
        order: [['createdAt', 'DESC']],
    });
};
exports.findPostsBy = findPostsBy;
// 좋아요 정보를 포함한 모든 게시글 검색
const findAllPosts = async () => {
    return await Paper.findAll({ include: { model: User, as: 'Likes' } });
};
exports.findAllPosts = findAllPosts;
// 인기도 순으로 유저 정렬 및 검색
const findBestUsers = async () => {
    return await User.findAll({
        order: [['popularity', 'DESC']],
        limit: 10,
        attributes: ['userId', 'nickname', 'profileImage', 'popularity'],
    });
};
exports.findBestUsers = findBestUsers;
// 특정 유저 검색
const findUser = async (userId) => {
    return await User.findOne({ where: { userId } });
};
exports.findUser = findUser;
// 특정 유저 정보와 관련 구독 내역 검색
const findMiniInfo = async (userId) => {
    return await User.findOne({
        where: { userId },
        attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
        include: { model: User, as: 'Followers', attributes: ['userId'] },
    });
};
exports.findMiniInfo = findMiniInfo;
// 특정 유저 정보와 관련 게시글 검색
const findUserInfo = async (userId) => {
    return await User.findOne({
        where: { userId },
        attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
        include: { model: Paper, attributes: ['postId', 'title', 'contents', 'createdAt'] },
        order: [[Paper, 'createdAt', 'DESC']],
    });
};
exports.findUserInfo = findUserInfo;
// 특정 게시글 검색
const findPost = async (postId) => {
    return await Paper.findOne({ where: { postId } });
};
exports.findPost = findPost;
// 특정 게시글 정보와 관련 유저, 댓글 검색
const findPostInfo = async (postId) => {
    return await Paper.findOne({
        where: { postId },
        include: [
            { model: Comment },
            { model: User, as: 'Users', attributes: ['nickname', 'profileImage'] },
        ],
    });
};
exports.findPostInfo = findPostInfo;
// 게시글 작성
const createPost = async (title, contents, thumbnail, userId) => {
    return await Paper.create({ title, contents, thumbnail, userId });
};
exports.createPost = createPost;
// 이미지 & 썸네일 게시글 번호 등록
const updateImage = async (postId, images) => {
    const originalImages = await Image.findAll({ where: { postId }, raw: true });
    if (originalImages.length) {
        const replaced = originalImages.filter((img) => !images.includes(img.imageUrl));
        for (let item of replaced) {
            await deleteImg(item.imageUrl);
            await Image.destroy({ where: { imageId: item.imageId } });
        }
    }
    return await Image.update({ postId: postId }, { where: { imageUrl: { [Op.in]: images } } }, { updateOnDuplicate: true });
};
exports.updateImage = updateImage;
// 포인트 지급
const updatePoint = async (userId) => {
    await User.increment({ point: +1 }, { where: { userId } });
};
exports.updatePoint = updatePoint;
// 이미지 생성
const createImage = async (imageUrl) => {
    await Image.create({ imageUrl });
};
exports.createImage = createImage;
// 게시글 수정
const updatePost = async (title, contents, thumbnail, userId, postId) => {
    return await Paper.update({ title, contents, thumbnail }, { where: { userId, postId } });
};
exports.updatePost = updatePost;
// 게시글 & 썸네일 & 이미지 삭제
const destroyPost = async (userId, postId) => {
    const images = await Image.findAll({ where: { postId } }, { raw: true });
    const paper = await Paper.findOne({ where: { userId, postId } });
    for (let image of images) {
        await deleteImg(image.imageUrl);
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
