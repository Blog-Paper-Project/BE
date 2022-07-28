import * as cron from 'node-cron';
import * as dayjs from 'dayjs';
import logger from './winston';
import { deleteImg } from './multer';

const { Op } = require('sequelize');
const { Image } = require('../../models');

export default cron.schedule('10 0 * * *', async () => {
  try {
    const images: Models.Image[] = await Image.findAll({
      where: {
        postId: null,
        updatedAt: { [Op.lt]: dayjs().subtract(1, 'd').format() },
      },
    });

    await Promise.all(
      images.map(async (image) => {
        await deleteImg(image.url);
        // @ts-ignore
        await image.destroy();
      })
    );

    logger.info('이미지 스케쥴러 성공');
  } catch (err) {
    logger.error(err);
  }
});
