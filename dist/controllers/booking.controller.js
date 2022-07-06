const bookingService = require('../services/booking.service');
const { Leaf } = require('../../models/leaf');

//예약 신청
const createBooking = async (req, res) => {
  const userId = req.params.userId;
  const { date, time, leaf } = req.body;
  const guestId = res.locals.user.userId;
  const hostId = req.params.userId;
  console.log(userId, date, time, leaf, guestId, hostId);

  if (!date || !time === '') {
    return res.status(400).send({ result: false });
  } else if (userId == guestId) {
    return res.status(400).send({ result: false });
  }

  try {
    const booking_result = await bookingService.createBooking(
      userId,
      date,
      time,
      guestId,
      leaf,
      hostId
    );
    return res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.createBooking = createBooking;

//게스트(신청자)예약 조회
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

//호스트(주최자) 예약조회
const hostBooking = async (req, res) => {
  const hostId = res.locals.user.userId;
  console.log(hostId);
  try {
    const hostResult = await bookingService.hostInquireBooking(hostId);
    return res.status(200).json({ hostResult, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.hostBooking = hostBooking;
// 예약 수정
const amendBooking = async (req, res) => {
  const userId = res.locals.user.userId;
  const guestId = res.locals.user.userId;
  const hostId = req.params.userId;
  const date = req.body.date;
  const time = req.body.time;
  const bookingList = await bookingService.checkBooking(guestId, hostId);
  const bookingId = bookingList[0].bookingId;
  console.log(bookingList);

  try {
    const booking_result = await bookingService.changeBooking(date, time, bookingId);
    res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.amendBooking = amendBooking;

// 예약 취소
const cancelBooking = async (req, res) => {
  const guestId = res.locals.user.userId;
  const giverId = res.locals.user.userId;
  const recipientId = req.params.userId;
  const hostId = req.params.userId;
  //console.log(guestId, hostId, recipientId);
  const pointList = await bookingService.findLeaf(giverId, guestId);
  const point = pointList[1].leaf;
  const bookingList = await bookingService.checkBooking(guestId, hostId);
  const booking = bookingList[0].bookingId;
  console.log(booking, point);

  try {
    const booking_result = await bookingService.cancelBooking(
      booking,
      point,
      guestId,
      recipientId,
      giverId
    );

    res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.cancelBooking = cancelBooking;
