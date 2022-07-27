import * as cron from 'node-cron';
import logger from './winston';

const { Paper } = require('../../models');
const { redisCli } = require('../../app');

export default cron.schedule('0 0 * * *', async () => {
  try {
    const papers: Models.Paper[] = await Paper.findAll();

    await Promise.all(
      papers.map(async (paper) => {
        const postId = String(paper.postId);
        const count = await redisCli.v4.sCard(postId);

        await redisCli.v4.del(postId);
        // @ts-ignore
        await paper.increment({ viewCount: +count });
      })
    );

    logger.info('조회수 스케쥴러 성공');
  } catch (err) {
    logger.error(err);
  }
});
