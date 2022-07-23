import * as cron from 'node-cron';
import * as dayjs from 'dayjs';
import logger from './winston';
import { deleteImg } from './multer';

const { Op } = require('sequelize');
const { Image } = require('../../models');

export default cron.schedule('* */3 * * *', async () => {
  try {
    const images = await Image.findAll({
      where: {
        postId: null,
        updatedAt: { [Op.lt]: dayjs().subtract(1, 'd').format() },
      },
    });
    // eslint-disable-next-line
    for await (const image of images) {
      await deleteImg(image.url);
      await image.destroy();
    }

    logger.info('이미지 스케쥴러 성공');
  } catch (err) {
    logger.error('이미지 스케쥴러 에러');
    console.log(err);
  }
});
