"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubs = exports.createLike = exports.deleteComment = exports.updateComment = exports.createComment = exports.deletePost = exports.updatePost = exports.createPost = exports.readPost = exports.readMiniProfile = exports.readBlog = exports.readMain = void 0;
const custom_error_1 = require("../modules/custom_error");
const date_1 = require("../modules/date");
const paperService = require("../services/paper.service");
const validate_paper_1 = require("../modules/validate_paper");
const { Paper } = require('../../models');
const readMain = async (req, res, next) => {
    try {
        const { keyword } = req.query;
        if (keyword) {
            // 키워드를 입력하면 최신 순으로 결과 출력
            const papers = await paperService.findPostsBy(keyword);
            return res.json({ papers });
        }
        let papers = await paperService.findAllPosts();
        papers = papers // 1주일 간 좋아요를 많이 받은 게시글 순으로 정렬
            .map((paper) => {
            const { postId, userId, title, Likes } = paper;
            const likes = Likes.filter((like) => new Date(like.createdAt) > (0, date_1.default)()).length;
            return { postId, userId, title, likes };
        })
            .sort((a, b) => b['likes'] - a['likes']);
        const popularUsers = await paperService.findBestUsers();
        res.json({ papers, popularUsers });
    }
    catch (err) {
        next(err);
    }
};
exports.readMain = readMain;
const readBlog = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!+userId) {
            return next((0, custom_error_1.createError)(400, '유효하지 않은 입력값'));
        }
        const user = await paperService.findUserInfo(userId);
        res.json({ user });
    }
    catch (err) {
        next(err);
    }
};
exports.readBlog = readBlog;
const readMiniProfile = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, '유저 인증 실패'));
        }
        const user = await paperService.findMiniInfo(userId);
        if (!user) {
            return next((0, custom_error_1.createError)(404, 'Not Found!'));
        }
        res.json({ user });
    }
    catch (err) {
        next(err);
    }
};
exports.readMiniProfile = readMiniProfile;
const readPost = async (req, res, next) => {
    try {
        const { userId, postId } = req.params;
        if (!+userId || !+postId) {
            return next((0, custom_error_1.createError)(400, '유효하지 않은 입력값'));
        }
        const paper = await paperService.findPostInfo(postId);
        if (!paper) {
            return next((0, custom_error_1.createError)(404, 'Not Found!'));
        }
        res.json({ paper });
    }
    catch (err) {
        next(err);
    }
};
exports.readPost = readPost;
const createPost = async (req, res, next) => {
    try {
        // const userId = res.locals?.user?.userId;
        const userId = 1; // 임시로 로그인 인증 기능 제거
        const { title, contents } = req.body;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, '유저 인증 실패'));
        }
        const schema = (0, validate_paper_1.validatePaper)();
        await schema.validateAsync({ title, contents });
        const paper = await paperService.createPost(title, contents, userId);
        if (!paper) {
            return next((0, custom_error_1.createError)(400, '게시글 생성 실패'));
        }
        await paperService.updatePoint(userId);
        res.json({ paper });
    }
    catch (err) {
        next(err);
    }
};
exports.createPost = createPost;
const updatePost = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { title, contents } = req.body;
        const { postId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, '유저 인증 실패'));
        }
        if (!+userId || !+postId) {
            return next((0, custom_error_1.createError)(400, '유효하지 않은 입력값'));
        }
        const schema = (0, validate_paper_1.validatePaper)();
        await schema.validateAsync({ title, contents });
        const paper = await paperService.updatePost(title, contents, userId, postId);
        if (!paper[0]) {
            return next((0, custom_error_1.createError)(400, '게시글 수정 실패'));
        }
        res.json({ result: true, title, contents });
    }
    catch (err) {
        next(err);
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, '유저 인증 실패'));
        }
        if (!+postId) {
            return next((0, custom_error_1.createError)(400, '유효하지 않은 입력값'));
        }
        const paper = await paperService.destroyPost(userId, postId);
        if (!paper) {
            return next((0, custom_error_1.createError)(404, 'Not Found!'));
        }
        res.json({ result: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deletePost = deletePost;
const createComment = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId } = req.params;
        const { comment } = req.body;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, '유저 인증 실패'));
        }
        else if (!comment) {
            return next((0, custom_error_1.createError)(400, '내용을 입력해주세요'));
        }
        const schema = (0, validate_paper_1.validateComment)();
        await schema.validateAsync({ comment });
        const paper = await Paper.findOne({ where: { postId } });
        if (!paper) {
            return next((0, custom_error_1.createError)(404, 'Not Found!'));
        }
        const newComment = await paperService.createComment(comment, userId, postId);
        res.json({ result: true, newComment });
    }
    catch (err) {
        next(err);
    }
};
exports.createComment = createComment;
const updateComment = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId, commentId } = req.params;
        const { comment } = req.body;
        if (!+userId) {
            return next((0, custom_error_1.createError)(401, '유저 인증 실패'));
        }
        else if (!comment) {
            return next((0, custom_error_1.createError)(400, '내용을 입력해주세요'));
        }
        const schema = (0, validate_paper_1.validateComment)();
        await schema.validateAsync({ comment });
        const paper = await paperService.findPost(postId);
        if (!paper) {
            return next((0, custom_error_1.createError)(404, 'Not Found!'));
        }
        const updatedComment = await paperService.updateComment(comment, commentId, userId, postId);
        if (!updatedComment[0]) {
            return next((0, custom_error_1.createError)(404, 'Not Found 혹은 변경사항 없음'));
        }
        res.json({ result: true, comment });
    }
    catch (err) {
        next(err);
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId, commentId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, '유저 인증 실패'));
        }
        const paper = await paperService.findPost(postId);
        if (!paper) {
            return next((0, custom_error_1.createError)(404, 'Not Found!'));
        }
        const deletedComment = await paperService.destroyComment(commentId, userId, postId);
        if (!deletedComment) {
            return next((0, custom_error_1.createError)(404, 'Not Found'));
        }
        res.json({ result: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteComment = deleteComment;
const createLike = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, '유저 인증 실패'));
        }
        const paper = await paperService.findPost(postId);
        if (!paper) {
            return next((0, custom_error_1.createError)(404, 'Not Found!'));
        }
        else if (userId === paper.userId) {
            return next((0, custom_error_1.createError)(400, '본인 게시글에 추천 불가'));
        }
        const liked = await paper.getLikes({ where: { userId } });
        if (liked.length) {
            await paper.removeLikes(userId);
            return res.json({ result: true, message: '좋아요 취소' });
        }
        await paper.addLikes(userId);
        res.json({ result: true, message: '좋아요 완료' });
    }
    catch (err) {
        next(err);
    }
};
exports.createLike = createLike;
const createSubs = async (req, res, next) => {
    try {
        const myId = res.locals?.user?.userId;
        const { userId: writerId } = req.params;
        if (!myId) {
            return next((0, custom_error_1.createError)(401, '유저 인증 실패'));
        }
        else if (!+myId || !+writerId) {
            return next((0, custom_error_1.createError)(400, '유효하지 않은 입력값'));
        }
        else if (+myId === +writerId) {
            return next((0, custom_error_1.createError)(400, '본인 구독 불가'));
        }
        const user = await paperService.findUser(writerId);
        if (!user) {
            return next((0, custom_error_1.createError)(404, 'Not Found!'));
        }
        const subbed = await user.getFollowees({ where: { userId: myId } });
        if (subbed.length) {
            await user.removeFollowees(myId);
            return res.json({ result: true, message: '구독 취소' });
        }
        await user.addFollowees(myId);
        res.json({ result: true, message: '구독 완료' });
    }
    catch (err) {
        next(err);
    }
};
exports.createSubs = createSubs;
