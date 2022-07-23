"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("node-cron");
const dayjs = require("dayjs");
const winston_1 = require("./winston");
const multer_1 = require("./multer");
const { Op } = require('sequelize');
const { Image } = require('../../models');
exports.default = cron.schedule('* * */3 * * *', async () => {
    try {
        const images = await Image.findAll({
            where: {
                postId: null,
                updatedAt: { [Op.lt]: dayjs().subtract(1, 'd').format() },
            },
        });
        // eslint-disable-next-line
        for await (const image of images) {
            await (0, multer_1.deleteImg)(image.url);
            await image.destroy();
        }
        winston_1.default.info('스케쥴러 성공');
    }
    catch (err) {
        winston_1.default.error('스케쥴러 에러');
        console.log(err);
    }
});
