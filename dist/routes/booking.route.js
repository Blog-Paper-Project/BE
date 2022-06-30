const express = require('express');
const sequelize = require('sequelize');
const Authmiddle = require('../middleware/auth');
const { User, Paper, Booking } = require('../../models');
const router = express.Router();

router.post('/:userId', Authmiddle, async (req, res) => {
  const userId = req.params.userId;
  const { date, time } = req.body;
  const guestId = res.locals.user.userId;

  console.log(userId, date, time, guestId);

  if (date === undefined) {
    return res.status(400).send({ result: false });
  }

  try {
    const result = await Booking.create({
      hostId: userId,
      date,
      time,
      guestId,
    });
    return res.status(200).json({ result });
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
    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
  }
});

//수정
router.patch('/:userId', Authmiddle, async (req, res) => {
  const guestId = res.locals.user.userId;
  console.log(req.params.userId);
  try {
    await Booking.findOne(
      {
        date: req.body.date,
        time: req.body.time,
      },
      {
        where: { guestId: Number(guestId) },
      }
    );
    const result = await Booking.findAll({
      where: { guestId: Number(guestId) },
    });

    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
  }
});

//삭제
router.delete('/:userId', Authmiddle, async (req, res) => {
  const guestId = res.locals.user.userId;
  console.log(guestId);
  try {
    const result = await Booking.destroy({
      where: { guestId: Number(guestId) },
    });

    res.status(200).json({ result: success });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
