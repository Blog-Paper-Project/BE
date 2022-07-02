const express = require('express');
const sequelize = require('sequelize');
const Authmiddle = require('../middleware/auth');
const { User, Paper, Booking, Leaf } = require('../../models');
const router = express.Router();

router.post('/:userId', Authmiddle, async (req, res) => {
  const userId = req.params.userId;
  const { date, time, leaf } = req.body;
  const guestId = res.locals.user.userId;
  console.log(userId, date, time, leaf, guestId);

  if (!date || !time === '') {
    return res.status(400).send({ result: false });
  }

  try {
    const booking_result = await Booking.create({
      hostId: userId,
      date,
      time,
      guestId,
    });
    await User.decrement({ point: `${leaf}` }, { where: { userId: guestId } });

    await User.increment({ point: `${leaf}` }, { where: { userId } });

    await Leaf.create({
      leaf,
      remarks: '화상채팅 예약',
      giverId: guestId,
      recipientId: userId,
    });

    return res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
  }
});

//예약 가져오기
router.get('/:userId', Authmiddle, async (req, res) => {
  const guestId = res.locals.user.userId;
  console.log(guestId);
  try {
    const result = await Booking.findAll({
      where: { guestId: Number(guestId) },
    });
    console.log(result);

    return res.status(200).json({ result });
  } catch (error) {
    console.log(error);
  }
});

//수정
router.patch('/:userId', Authmiddle, async (req, res) => {
  const guestId = res.locals.user.userId;
  console.log(req.params.userId);
  try {
    await Booking.update(
      {
        date: req.body.date,
        time: req.body.time,
      },
      {
        where: { guestId: Number(guestId) },
      }
    );
    const booking_result = await Booking.findAll({
      where: { guestId: Number(guestId) },
    });

    res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
  }
});

//취소
router.delete('/:userId', Authmiddle, async (req, res) => {
  const guestId = res.locals.user.userId;
  const giverId = res.locals.user.userId;
  const recipientId = req.params.userId;
  console.log(giverId, recipientId);

  try {
    const point = await Leaf.findOne({
      where: { giverId: guestId },
    });

    const booking_result = await Booking.destroy({
      where: { guestId: Number(guestId) },
    });

    await User.increment({ point: point.leaf }, { where: { userId: guestId } });

    await User.decrement({ point: point.leaf }, { where: { userId: recipientId } });

    console.log(point.leaf, giverId, recipientId);
    await Leaf.create({
      leaf: point.leaf,
      remarks: '화상채팅 취소',
      giverId: recipientId,
      recipientId: giverId,
    });

    res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
