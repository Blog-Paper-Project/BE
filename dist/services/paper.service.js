"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyComment = exports.updateComment = exports.createComment = exports.destroyPost = exports.updatePost = exports.updatePoint = exports.createPost = exports.findPostInfo = exports.findPost = exports.findUserInfo = exports.findMiniInfo = exports.findUser = exports.findBestUsers = exports.findAllPosts = exports.findPostsBy = void 0;
const { Paper, User, Comment } = require('../../models');
const sequelize_1 = require("sequelize");
// 키워드로 게시글 검색
const findPostsBy = async (keyword) => {
    return await Paper.findAll({
        where: { title: { [sequelize_1.Op.like]: `%${keyword}%` } },
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
const createPost = async (title, contents, userId) => {
    return await Paper.create({ title, contents, userId });
};
exports.createPost = createPost;
// 포인트 지급
const updatePoint = async (userId) => {
    return await User.increment({ point: +1 }, { where: { userId } });
};
exports.updatePoint = updatePoint;
// 게시글 수정
const updatePost = async (title, contents, userId, postId) => {
    return await Paper.update({ title, contents }, { where: { userId, postId } });
};
exports.updatePost = updatePost;
// 게시글 삭제
const destroyPost = async (userId, postId) => {
    console.log(userId, postId);
    return await Paper.destroy({ where: { userId, postId } });
};
exports.destroyPost = destroyPost;
// 댓글 작성
const createComment = async (comment, userId, postId) => {
    return await Comment.create({
        comment,
        userId,
        postId: +postId,
    });
};
exports.createComment = createComment;
// 댓글 수정
const updateComment = async (comment, commentId, userId, postId) => {
    return await Comment.update({ comment }, { where: { commentId, userId, postId } });
};
exports.updateComment = updateComment;
// 댓글 삭제
const destroyComment = async (commentId, userId, postId) => {
    return await Comment.destroy({ where: { userId, commentId, postId } });
};
exports.destroyComment = destroyComment;
