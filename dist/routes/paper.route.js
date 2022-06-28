"use strict";
const express = require("express");
const sequelize_1 = require("sequelize");
const custom_error_1 = require("../modules/custom_error");
const { Paper, User } = require('../../models');
const router = express.Router();
// 회원가입 테스트
router.get('/test', async (req, res, next) => {
    await User.create({ email: 'jun@naver.com', nickname: '김성준' });
    const users = await User.findAll();
    res.json({ users });
});
// 인기 게시글 조회 & 게시글 검색
router.get('/', async (req, res, next) => {
    try {
        const { search } = req.query;
        if (search) {
            const papers = await Paper.findAll({
                where: { title: { [sequelize_1.Op.like]: `%${search || ''}%` } },
                order: [['createdAt', 'DESC']],
            });
            return res.json({ papers });
        }
        let papers = await Paper.findAll({
            include: { model: User, as: 'Likes' },
        });
        papers = papers
            .map((paper) => {
            const { id: postId, title, Likes } = paper;
            const likes = Likes.filter((like) => like.createdAt < new Date() // 추천 반영 기간 설정 필요
            ).length;
            return { postId, title, likes };
        })
            .sort((a, b) => b['likes'] - a['likes'])
            .slice(0, 5);
        const popularUsers = await User.findAll({
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
            where: { id: userId },
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
            return next((0, custom_error_1.createError)(400, 'Invalid Input'));
        }
        const papers = await Paper.findOne({ where: { userId, id: postId } });
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['nickname', 'profileImage', 'introduction', 'popularity'],
        });
        if (!user || !papers) {
            return next((0, custom_error_1.createError)(404, 'Not Found'));
        }
        res.json({ papers, user });
    }
    catch (err) {
        next(err);
    }
});
// 상세페이지 작성
router.post('/', async (req, res, next) => {
    try {
        // const { userId } = res.locals.user
        const { title, contents, userId } = req.body;
        const result = await Paper.create({ title, contents, UserId: userId });
        res.json({ result });
    }
    catch (err) {
        next(err);
    }
});
module.exports = router;
