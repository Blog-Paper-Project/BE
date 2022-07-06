const cron = require('node-cron');
const sequelize = require('sequelize');
const { Op } = sequelize;

const User = require('../../models/user');

const task = cron.schedule(
  '* * * 1/3 *',
  async () => {
    const user = await User.findAll({
      where: {
        deletedAt: {
          [Op.ne]: null,
        },
      },
    });
    // console.log(user[i].id);
    for (let i = 0; i < user.length; i++) {
      if (user.length != i) {
        console.log(user[i].userId);
        await User.destroy({ where: { userId: user[i].userId } });
      }
    }
  },
  {
    scheduled: false,
  }
);

task.start();
