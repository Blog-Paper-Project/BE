"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("node-cron");
const winston_1 = require("./winston");
const { Paper } = require('../../models');
const { redisCli } = require('../../app');
exports.default = cron.schedule('0 0 * * *', async () => {
    try {
        const papers = await Paper.findAll();
        await Promise.all(papers.map(async (paper) => {
            const postId = String(paper.postId);
            const count = await redisCli.v4.sCard(postId);
            await redisCli.v4.del(postId);
            // @ts-ignore
            await paper.increment({ viewCount: +count });
        }));
        winston_1.default.info('조회수 스케쥴러 성공');
    }
    catch (err) {
        winston_1.default.error(err);
    }
});
