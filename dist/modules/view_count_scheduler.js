"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require('node-cron');
const logger = require('./winston');
const { Paper } = require('../../models');
const { redisCli } = require('../../app');
exports.default = cron.schedule('*/5 * * * * *', async () => {
    try {
        const papers = await Paper.findAll();
        // eslint-disable-next-line
        for await (const paper of papers) {
            const postId = String(paper.postId);
            const count = await redisCli.v4.sCard(postId);
            await redisCli.v4.del(postId);
            await paper.increment({ viewCount: +count });
        }
        logger.info('조회수 스케쥴러 성공');
    }
    catch (err) {
        logger.error('조회수 스케쥴러 에러');
        console.log(err);
    }
});
