"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyComment = exports.updateComment = exports.createComment = exports.destroyPost = exports.updatePost = exports.createPost = exports.findUserPost = exports.findUser = exports.findUserPosts = exports.findBestUsers = exports.findAllPosts = exports.findBestPosts = void 0;
const { Paper, User, Comment } = require('../../models');
const sequelize_1 = require("sequelize");
// 키워드를 포함한 게시글 검색
const findBestPosts = async (keyword) => {
    return await Paper.findAll({
        where: { title: { [sequelize_1.Op.like]: `%${keyword || ''}%` } },
        order: [['createdAt', 'DESC']],
    });
};
exports.findBestPosts = findBestPosts;
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
const findUserPosts = async (userId) => {
    return await Paper.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
    });
};
exports.findUserPosts = findUserPosts;
const findUser = async (userId) => {
    return await User.findOne({
        where: { userId },
        attributes: ['userId', 'nickname', 'profileImage', 'introduction', 'popularity'],
    });
};
exports.findUser = findUser;
const findUserPost = async (postId, userId) => {
    return userId
        ? await Paper.findOne({ where: { postId, userId } })
        : await Paper.findOne({ where: { postId } });
};
exports.findUserPost = findUserPost;
const createPost = async (title, contents, userId) => {
    return await Paper.create({ title, contents, userId });
};
exports.createPost = createPost;
const updatePost = async (title, contents, userId, postId) => {
    return await Paper.update({ title, contents }, { where: { userId, postId } });
};
exports.updatePost = updatePost;
const destroyPost = async (userId, postId) => {
    console.log(userId, postId);
    return await Paper.destroy({ where: { userId, postId } });
};
exports.destroyPost = destroyPost;
const createComment = async (comment, userId, postId) => {
    return await Comment.create({
        comment,
        userId,
        postId: +postId,
    });
};
exports.createComment = createComment;
const updateComment = async (comment, commentId, userId, postId) => {
    return await Comment.update({ comment }, { where: { commentId, userId, postId } });
};
exports.updateComment = updateComment;
const destroyComment = async (commentId, userId, postId) => {
    return await Comment.destroy({ where: { userId, commentId, postId } });
};
exports.destroyComment = destroyComment;
