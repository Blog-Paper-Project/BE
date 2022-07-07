const cron = require('node-cron');
const sequelize = require('sequelize');
const { Op } = sequelize;

const User = require('../../models/user');

const task = cron.schedule(
  '* * * * * *',
  async () => {
    try {
      console.log('123');
      const user = await User.findAll({
        where: {
          deletedAt: {
            [Op.ne]: null,
          },
        },
      });
      // console.log(user[0].deletedAt);
      for (let i = 0; i < user.length; i++) {
        console.log(setTimeout(new Date(), user[i].deletedAt), 5000);
        // if (user[i].deletedAt + 5000) {

        //   await User.destroy({ where: { userId: user[i].userId } });
        // }
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
