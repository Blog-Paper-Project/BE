"use strict";
const express = require("express");
const sequelize_1 = require("sequelize");
const custom_error_1 = require("../modules/custom_error");
const { Paper, User } = require('../../models');
const auth = require('../middleware/Auth');
const calcOneWeek = require('../modules/date');
const router = express.Router();
// 인기 게시글 조회 & 게시글 검색
router.get('/', async (req, res, next) => {
    try {
        const { keyword } = req.query;
        if (keyword) {
            // 키워드를 입력하면 최신 순으로 결과 출력
            const papers = await Paper.findAll({
                where: { title: { [sequelize_1.Op.like]: `%${keyword || ''}%` } },
                order: [['createdAt', 'DESC']],
            });
            return res.json({ papers });
        }
        let papers = await Paper.findAll({
            include: { model: User, as: 'Likes' },
        });
        papers = papers // 1주일 간 좋아요 많은 게시글 순으로 정렬
            .map((paper) => {
            const { postId, title, Likes } = paper;
            const likes = Likes.filter((like) => {
                new Date(like.createdAt) > calcOneWeek(); // 추천 반영 기간 설정 필요
            }).length;
            return { postId, title, likes };
        })
            .sort((a, b) => b['likes'] - a['likes'])
            .slice(0, 5);
        const popularUsers = await User.findAll({
            // 인기도 순으로 유저 정렬
            order: [['popularity', 'DESC']],
            limit: 3,
            attributes: ['nickname', 'profileImage', 'popularity'],
        });
        res.json({ papers, popularUsers });
    }
    catch (err) {
        next(err);
    }
});
// 블로그 메인 페이지 조회
router.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const papers = await Paper.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });
        const user = await User.findOne({
            where: { userId },
            attributes: ['nickname', 'profileImage', 'introduction', 'popularity'],
        });
        res.json({ papers, user });
    }
    catch (err) {
        next(err);
    }
});
// 상세페이지 조회
router.get('/:userId/:postId', async (req, res, next) => {
    try {
        const { userId, postId } = req.params;
        if (!+userId || !+postId) {
            // 아이디 값이 숫자가 아닌 경우
            return next((0, custom_error_1.createError)(400, 'Invalid Input'));
        }
        const papers = await Paper.findOne({ where: { userId, postId } });
        const user = await User.findOne({
            where: { userId },
            attributes: ['nickname', 'profileImage', 'introduction', 'popularity'],
        });
        if (!user || !papers) {
            // 해당 유저나 게시글을 찾을 수 없는 경우
            return next((0, custom_error_1.createError)(404, 'Not Found'));
        }
        res.json({ papers, user });
    }
    catch (err) {
        next(err);
    }
});
// 상세페이지 작성
router.post('/', auth, async (req, res, next) => {
    try {
        const { userId } = res.locals.user;
        const { title, contents } = req.body;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, 'Unauthorized'));
        }
        const paper = await Paper.create({ title, contents, userId });
        if (!paper) {
            return next((0, custom_error_1.createError)(400, 'Create Failed'));
        }
        res.json({ paper });
    }
    catch (err) {
        next(err);
    }
});
// 상세페이지 수정
router.patch('/:postId', auth, async (req, res, next) => {
    try {
        const { userId } = res.locals.user;
        const { title, contents } = req.body;
        const { postId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, 'Unauthorized'));
        }
        const paper = await Paper.update({ title, contents }, { where: { userId, postId } });
        if (!paper[0]) {
            return next((0, custom_error_1.createError)(400, 'Update Failed'));
        }
        res.json({ result: true });
    }
    catch (err) {
        next(err);
    }
});
// 상세페이지 삭제
router.delete('/:postId', auth, async (req, res, next) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;
        if (!userId) {
            return next((0, custom_error_1.createError)(401, 'Unauthorized'));
        }
        const paper = await Paper.destroy({ where: { userId, postId } });
        if (!paper) {
            return next((0, custom_error_1.createError)(400, 'Delete Failed'));
        }
        res.json({ result: true });
    }
    catch (err) {
        next(err);
    }
});
module.exports = router;
