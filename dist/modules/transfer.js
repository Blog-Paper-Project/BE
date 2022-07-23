const cron = require('node-cron');
const dayjs = require('dayjs');
const app = require('../../app');
const Booking = require('../../models/booking');
const redisCli = app.redisCli;

const trans = cron.schedule(
  ' 0  12 1-31  * *', // 수정
  async () => {
    try {
      const booking = await Booking.findAll();
      for (let i = 0; i < booking.length; i++) {
        const meeting = booking[i].date;
        const now = dayjs().format('YYYY-MM-DD dddd');
        if (meeting === now) {
          await redisCli.set(
            booking[i].bookingId,
            booking[i].data,
            booking[i].time,
            booking[i].accepted,
            booking[i].leaf,
            booking[i].hostId,
            booking[i].guestId
          );
          Booking.destroy({ where: { blogId: booking[i].blogId } });
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  {
    scheduled: false,
  }
);

trans.start();
