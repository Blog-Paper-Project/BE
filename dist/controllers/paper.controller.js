"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubs = exports.createLike = exports.deleteComment = exports.updateComment = exports.createComment = exports.deletePost = exports.updatePost = exports.createImage = exports.createPost = exports.readPost = exports.readMiniProfile = exports.readBlog = exports.readMain = void 0;
const custom_error_1 = require("../modules/custom_error");
const date_1 = require("../modules/date");
const PaperService = require("../services/paper.service");
const validate_paper_1 = require("../modules/validate_paper");
const { Paper } = require('../../models');
// 메인 페이지 조회 & 게시글 검색
const readMain = async (req, res, next) => {
    try {
        const { keyword } = req.query;
        if (keyword) {
            // 키워드를 입력하면 최신 순으로 결과 출력
            const papers = await PaperService.findPostsBy(keyword);
            return res.json({ papers });
        }
        let papers = await PaperService.findAllPosts();
        papers = papers // 1주일 간 좋아요를 많이 받은 게시글 순으로 정렬
            .map((paper) => {
            const { postId, userId, title, thumbnail, Likes } = paper;
            const likes = Likes.filter((like) => new Date(like.createdAt) > (0, date_1.default)()).length;
            return { postId, userId, title, thumbnail, likes };
        })
            .sort((a, b) => b.likes - a.likes);
        const popularUsers = await PaperService.findBestUsers();
        return res.json({ papers, popularUsers });
    }
    catch (err) {
        return next(err);
    }
};
exports.readMain = readMain;
// 개인 페이지 조회
const readBlog = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!+userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        const user = await PaperService.findUserInfo(userId);
        if (!user) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        return res.json({ user });
    }
    catch (err) {
        return next(err);
    }
};
exports.readBlog = readBlog;
// 미니 프로필 조회
const readMiniProfile = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        if (!userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        const user = await PaperService.findMiniInfo(userId);
        if (!user) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        return res.json({ user });
    }
    catch (err) {
        return next(err);
    }
};
exports.readMiniProfile = readMiniProfile;
// 상세 페이지 조회
const readPost = async (req, res, next) => {
    try {
        const { userId, postId } = req.params;
        if (!+userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        if (!+postId) {
            return next((0, custom_error_1.default)(400, `Invalid PostId : ${postId}`));
        }
        const paper = await PaperService.findPostInfo(postId);
        if (!paper) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        return res.json({ paper });
    }
    catch (err) {
        return next(err);
    }
};
exports.readPost = readPost;
// 상세 페이지 작성
const createPost = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { title, contents, thumbnail } = req.body;
        if (!userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        const schema = (0, validate_paper_1.validatePaper)();
        await schema.validateAsync({ title, contents });
        const paper = await PaperService.createPost(title, contents, thumbnail, userId);
        if (!paper) {
            return next((0, custom_error_1.default)(400, 'Paper Not Created'));
        }
        await PaperService.updatePoint(userId);
        return res.json({ paper });
    }
    catch (err) {
        return next(err);
    }
};
exports.createPost = createPost;
// 상세 페이지 이미지 첨부
const createImage = async (req, res, next) => {
    try {
        const { file } = req;
        if (!file?.transforms) {
            return next((0, custom_error_1.default)(400, 'Image Not Uploaded'));
        }
        return res.json({ result: true, imageUrl: file.transforms[0]?.key });
    }
    catch (err) {
        return next(err);
    }
};
exports.createImage = createImage;
// 상세 페이지 수정
const updatePost = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { title, contents, thumbnail } = req.body;
        const { postId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        if (!+postId) {
            return next((0, custom_error_1.default)(400, `Invalid PostId : ${postId}`));
        }
        const schema = (0, validate_paper_1.validatePaper)();
        await schema.validateAsync({ title, contents });
        const paper = await PaperService.updatePost(title, contents, thumbnail, userId, postId);
        if (!paper[0]) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        return res.json({ result: true, title, contents });
    }
    catch (err) {
        return next(err);
    }
};
exports.updatePost = updatePost;
// 상세 페이지 삭제
const deletePost = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        if (!+postId) {
            return next((0, custom_error_1.default)(400, `Invalid PostId : ${postId}`));
        }
        const paper = await PaperService.destroyPost(userId, postId);
        if (!paper) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        return res.json({ result: true });
    }
    catch (err) {
        return next(err);
    }
};
exports.deletePost = deletePost;
// 댓글 작성
const createComment = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId } = req.params;
        const { text } = req.body;
        if (!userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        if (!+postId) {
            return next((0, custom_error_1.default)(400, `Invalid PostId : ${postId}`));
        }
        const schema = (0, validate_paper_1.validateComment)();
        await schema.validateAsync({ text });
        const paper = await Paper.findOne({ where: { postId } });
        if (!paper) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        const comment = await PaperService.createComment(text, userId, postId);
        return res.json({ result: true, comment });
    }
    catch (err) {
        return next(err);
    }
};
exports.createComment = createComment;
// 댓글 수정
const updateComment = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId, commentId } = req.params;
        const { text } = req.body;
        if (!+userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        if (!+postId || !+commentId) {
            return next((0, custom_error_1.default)(400, 'Invalid PostId or CommentId'));
        }
        const schema = (0, validate_paper_1.validateComment)();
        await schema.validateAsync({ text });
        const paper = await PaperService.findPost(postId);
        if (!paper) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        const updatedComment = await PaperService.updateComment(text, commentId, userId, postId);
        if (!updatedComment[0]) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        return res.json({ result: true, text });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateComment = updateComment;
// 댓글 삭제
const deleteComment = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId, commentId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        if (!+postId || !+commentId) {
            return next((0, custom_error_1.default)(400, 'Invalid PostId or CommentId'));
        }
        const deletedComment = await PaperService.destroyComment(commentId, userId, postId);
        if (!deletedComment) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        return res.json({ result: true });
    }
    catch (err) {
        return next(err);
    }
};
exports.deleteComment = deleteComment;
// 좋아요 등록 및 취소
const createLike = async (req, res, next) => {
    try {
        const userId = res.locals?.user?.userId;
        const { postId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        if (!+postId) {
            return next((0, custom_error_1.default)(400, `Invalid PostId : ${postId}`));
        }
        const paper = await PaperService.findPost(postId);
        if (!paper) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        if (userId === paper.userId) {
            return next((0, custom_error_1.default)(400, 'Self-Like Forbidden'));
        }
        const liked = await paper.getLikes({ where: { userId } });
        if (liked.length) {
            await paper.removeLikes(userId);
            return res.json({ result: true, message: 'Like Canceled' });
        }
        await paper.addLikes(userId);
        return res.json({ result: true, message: 'Like Done' });
    }
    catch (err) {
        return next(err);
    }
};
exports.createLike = createLike;
// 구독 등록 및 취소
const createSubs = async (req, res, next) => {
    try {
        const myId = res.locals?.user?.userId;
        const { userId: writerId } = req.params;
        if (!myId) {
            return next((0, custom_error_1.default)(401, 'Unauthorized!'));
        }
        if (!+writerId) {
            return next((0, custom_error_1.default)(400, `Invalid WriterId : ${writerId}`));
        }
        if (+myId === +writerId) {
            return next((0, custom_error_1.default)(400, 'Self-Subs Forbidden'));
        }
        const user = await PaperService.findUser(writerId);
        if (!user) {
            return next((0, custom_error_1.default)(404, 'Not Found!'));
        }
        const subbed = await user.getFollowees({ where: { userId: myId } });
        if (subbed.length) {
            await user.removeFollowees(myId);
            return res.json({ result: true, message: 'Subs Canceled' });
        }
        await user.addFollowees(myId);
        return res.json({ result: true, message: 'Subs Done' });
    }
    catch (err) {
        return next(err);
    }
};
exports.createSubs = createSubs;
