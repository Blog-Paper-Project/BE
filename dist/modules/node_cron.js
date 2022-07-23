const cron = require('node-cron');
const dayjs = require('dayjs');

const User = require('../../models/user');

const task = cron.schedule(
  '0 0 * * *', // 수정
  async () => {
    try {
      const user = await User.findAll({
        where: {
          deletedAt: {
            [Op.ne]: null,
          },
        },
      });
      for (let i = 0; i < user.length; i++) {
        const stopdate = dayjs(user[i].deletedAt);
        const startdate = dayjs(new Date());

        if (
          startdate.format('YYYY-MM-DD HH:mm:ss') > // 수정
          stopdate.add(3, 'M').format('YYYY-MM-DD HH:mm:ss')
        ) {
          await User.destroy({ where: { userId: user[i].userId } });
        }
        return true;
      }
    } catch (error) {
      console.log(error);
    }
  },
  {
    scheduled: false,
  }
);

task.start();
