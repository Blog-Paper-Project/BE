const cron = require('node-cron');
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const logger = require('./winston');
const { Image } = require('../../models');
const { deleteImg } = require('./multer');

export default cron.schedule('* * */3 * * *', async () => {
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

    logger.info('스케쥴러 성공');
  } catch (err) {
    logger.error('스케쥴러 에러');
    console.log(err);
  }
});
