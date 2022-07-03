const bookingService = require('../services/booking.service');
const { Leaf } = require('../../models/leaf');

//예약 신청
const createBooking = async (req, res) => {
  const userId = req.params.userId;
  const { date, time, leaf } = req.body;
  const guestId = res.locals.user.userId;
  console.log(userId, date, time, leaf, guestId);

  if (!date || !time === '') {
    return res.status(400).send({ result: false });
  }
  try {
    const booking_result = await bookingService.createBooking(
      userId,
      date,
      time,
      guestId,
      leaf
    );
    return res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.createBooking = createBooking;

//예약 조회
const inquireBooking = async (req, res) => {
  const guestId = res.locals.user.userId;
  console.log(guestId);
  try {
    const inquireResult = await bookingService.inquireBooking(guestId);
    return res.status(200).json({ inquireResult, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.inquireBooking = inquireBooking;

// 예약 수정
const changeBooking = async (req, res) => {
  const userId = res.locals.user.userId;
  const guestId = res.locals.user.userId;
  const date = req.body.date;
  const time = req.body.time;
  console.log(res.locals.user);

  try {
    await bookingService.changeBooking(date, time, guestId);

    const booking_result = await bookingService.findBooking(guestId);

    res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.changeBooking = changeBooking;

// 예약 취소
const cancelBooking = async (req, res) => {
  const guestId = res.locals.user.userId;
  const giverId = res.locals.user.userId;
  const recipientId = req.params.userId;
  const hostId = req.params.userId;

  try {
    const pointList = await bookingService.findLeaf(giverId, guestId);
    const point = pointList[1].leaf;

    const booking_result = await bookingService.cancelBooking(
      point,
      guestId,
      recipientId,
      hostId,
      giverId
    );

    res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.cancelBooking = cancelBooking;
