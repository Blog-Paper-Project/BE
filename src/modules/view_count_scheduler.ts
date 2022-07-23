import * as cron from 'node-cron';
import logger from './winston';

const { Paper } = require('../../models');
const { redisCli } = require('../../app');

export default cron.schedule('0 0 * * *', async () => {
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
  } catch (err) {
    logger.error('조회수 스케쥴러 에러');
    console.log(err);
  }
});
