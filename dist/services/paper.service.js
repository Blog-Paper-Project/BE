"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyComment = exports.updateComment = exports.createComment = exports.destroyPost = exports.updateTags = exports.updatePost = exports.createImage = exports.updatePoint = exports.updateImage = exports.createTags = exports.createPost = exports.addCount = exports.findPostInfo = exports.findPost = exports.updateCategory = exports.findNewPosts = exports.findMiniInfo = exports.findUser = exports.findUserInfo = exports.findBestUsers = exports.findAllPosts = exports.findCachePosts = exports.findPostsBy = void 0;
/* eslint-disable */
const sequelize_1 = require("sequelize");
const multer_1 = require("../modules/multer");
const date_1 = require("../modules/date");
const { Paper, User, Comment, Image, Tag } = require('../../models');
const { redisCli } = require('../../app');
// 키워드로 게시글 검색
const findPostsBy = async (keyword) => {
    return (await Paper.findAll({
        where: {
            [sequelize_1.Op.or]: [
                { title: { [sequelize_1.Op.like]: `%${keyword}%` } },
                { contents: { [sequelize_1.Op.like]: `%${keyword}%` } },
            ],
        },
        order: [['createdAt', 'DESC']],
    }));
};
exports.findPostsBy = findPostsBy;
// 레디스에 저장된 메인 페이지 데이터 검색
const findCachePosts = async () => {
    const papers = await redisCli.v4.get('main');
    return JSON.parse(papers);
};
exports.findCachePosts = findCachePosts;
// 1주일간 좋아요 순으로 게시글 11개 검색 후 레디스에 저장
const findAllPosts = async () => {
    const papers = await Paper.findAll({
        include: [
            { model: User, as: 'Users', attributes: ['blogId', 'nickname'] },
            { model: User, as: 'Likes' },
        ],
    });
    const papersByLike = papers
        .map((paper) => {
        const { postId, title, contents, thumbnail, Likes, Users } = paper;
        const likes = Likes.filter((like) => like.createdAt > (0, date_1.calcDays)(7)).length;
        const { blogId, nickname } = Users;
        return { postId, blogId, nickname, title, contents, thumbnail, likes };
    })
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 11)
        .map((paper) => {
        paper.contents = paper.contents.replace(/!\[(.){0,50}\]\(https:\/\/hanghae-mini-project.s3.ap-northeast-2.amazonaws.com\/[0-9]{13}.[a-z]{3,4}\)/g, '');
        return paper;
    });
    await redisCli.set('main', JSON.stringify(papersByLike), 'EX', 600);
    return papersByLike;
};
exports.findAllPosts = findAllPosts;
// 인기도 순으로 유저 12명 검색
const findBestUsers = async () => {
    const users = await User.findAll({
        order: [['popularity', 'DESC']],
        limit: 12,
        attributes: [
            'userId',
            'blogId',
            'nickname',
            'introduction',
            'profileImage',
            'popularity',
        ],
    });
    const bottom = [...users.splice(3, 3), ...users.splice(6, 3)];
    return [...users, ...bottom];
};
exports.findBestUsers = findBestUsers;
// 특정 유저와 게시글 검색
const findUserInfo = async (blogId) => {
    const user = await User.findOne({
        where: { blogId },
        attributes: ['blogId', 'nickname', 'profileImage', 'introduction', 'popularity'],
        include: [
            {
                model: Paper,
                include: { model: Tag, attributes: ['name'] },
            },
            { model: User, as: 'Followers', attributes: ['blogId'] },
        ],
        order: [[Paper, 'createdAt', 'DESC']],
    });
    let categories = user?.Papers.map((paper) => paper.category);
    let tags = user?.Papers.flatMap((paper) => paper.Tags).map((tag) => tag.name);
    categories = [...new Set(categories)];
    tags = [...new Set(tags)];
    return [user, categories, tags];
};
exports.findUserInfo = findUserInfo;
// 특정 유저 검색
const findUser = async (blogId) => {
    return await User.findOne({ where: { blogId } });
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
// 구독 중인 최신 게시글 검색
const findNewPosts = async (userId) => {
    const user = (await User.findOne({
        where: { userId },
        include: {
            model: User,
            as: 'Followees',
            include: { model: Paper, attributes: ['postId', 'title', 'createdAt', 'userId'] },
        },
    }));
    const posts = user.Followees.flatMap((followee) => followee.Papers)
        .filter((paper) => paper.createdAt > (0, date_1.calcDays)(3))
        .sort((a, b) => (0, date_1.calcMs)(b.createdAt) - (0, date_1.calcMs)(a.createdAt));
    return posts;
};
exports.findNewPosts = findNewPosts;
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
            { model: User, as: 'Likes', attributes: ['nickname'] },
        ],
    });
};
exports.findPostInfo = findPostInfo;
// 조회수 증가
const addCount = async (postId, userId) => {
    await redisCli.sadd(postId, userId);
    return await redisCli.v4.sCard(postId);
};
exports.addCount = addCount;
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
    const originalImages = await Image.findAll({
        where: { postId },
        raw: true,
    });
    if (originalImages.length) {
        const replaced = originalImages.filter((img) => !images.includes(img.url));
        for (let item of replaced) {
            await (0, multer_1.deleteImg)(item.url);
            await Image.destroy({ where: { imageId: item.imageId } });
        }
    }
    return await Image.update({ postId: postId }, { where: { url: { [sequelize_1.Op.in]: images } } }, { updateOnDuplicate: true });
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
        await (0, multer_1.deleteImg)(image.url);
    }
    await (0, multer_1.deleteImg)(paper?.thumbnail);
    await redisCli.del(postId);
    return paper ? await paper.destroy() : paper;
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
    return await Comment.update({ text }, { where: { commentId, userId, postId } });
};
exports.updateComment = updateComment;
// 댓글 삭제
const destroyComment = async (commentId, userId, postId) => {
    return await Comment.destroy({ where: { userId, commentId, postId } });
};
exports.destroyComment = destroyComment;
