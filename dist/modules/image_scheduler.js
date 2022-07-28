"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("node-cron");
const dayjs = require("dayjs");
const winston_1 = require("./winston");
const multer_1 = require("./multer");
const { Op } = require('sequelize');
const { Image } = require('../../models');
exports.default = cron.schedule('10 0 * * *', async () => {
    try {
        const images = await Image.findAll({
            where: {
                postId: null,
                updatedAt: { [Op.lt]: dayjs().subtract(1, 'd').format() },
            },
        });
        await Promise.all(images.map(async (image) => {
            await (0, multer_1.deleteImg)(image.url);
            // @ts-ignore
            await image.destroy();
        }));
        winston_1.default.info('이미지 스케쥴러 성공');
    }
    catch (err) {
        winston_1.default.error(err);
    }
});
