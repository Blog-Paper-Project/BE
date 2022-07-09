const bookingService = require('../services/booking.service');
const dayjs = require('dayjs');
const { Leaf } = require('../../models/leaf');
const moment = require('moment');
const { start } = require('repl');
const { nextTick } = require('process');
//const db = require('../../config');
moment.tz.setDefault('Asia/Seoul');

//예약 신청
const createBooking = async (req, res) => {
  const userId = res.locals.user.userId;
  const { leaf, guestId, date } = req.body;
  const start = date.split('-')[0];
  const end = date.split('-')[1];

  const hostId = req.params.userId;
  const bookingMoment = new dayjs();
  const startMoment = dayjs(start);
  const time = moment.duration(startMoment.diff(bookingMoment)).asMinutes();

  const meetingMoment = dayjs(start);
  const meetingDate = dayjs(meetingMoment).format('YYYY-MM-DD');
  const meetingTime = dayjs(start).format('HH:mm:ss');
  const endTime = dayjs(end).format('HH:mm:ss');
  const bookingTime = `${meetingTime} - ${endTime}`;

  //b.query(sqlSelectCnt);

  if (time < 180) {
    res.status(400).send({ msg: '화상 채팅 3시간 전까지만 예약가능합니다.' });
    return;
  }
  if (hostId == guestId) {
    return res.status(400).send({ result: false });
  }

  try {
    const booking_result = await bookingService.createBooking(
      userId,
      guestId,
      leaf,
      hostId,
      bookingTime,
      meetingDate
    );
    return res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.createBooking = createBooking;

//예약 조회
const inquireBooking = async (req, res) => {
  const userId = res.locals.user.userId;
  console.log(userId);

  try {
    const inquireResult = await bookingService.inquireBooking(userId);
    const hostResult = await bookingService.hostInquireBooking(userId);
    return res.status(200).json({ inquireResult, hostResult, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.inquireBooking = inquireBooking;

// 예약 거절
// const rejectBooking = async (req, res) => {
//   const hostId = res.locals.user.userId;

//   const hostResult = await bookingService.hostInquireBooking(hostId);
//   // const guestId = guestIdList[].guestId;
//   // const guestId = hostResult.map((hostResult) => hostResult.guestId);
//   const bookingIdArray = hostResult.map((hostResult) => hostResult.bookingId);
//   const bookingId = bookingIdArray.find((element) => element != undefined);
//   console.log(bookingId);

//   try {
//     const rejectBooking = await bookingService.confirmBooking(hostId, bookingId);
//     return res.status(200).json({ rejectBooking, result: true });
//   } catch (error) {
//     console.log(error);
//   }
// };
// exports.rejectBooking = rejectBooking;

// 예약 취소
const cancelBooking = async (req, res) => {
  const guestId = res.locals.user.userId;
  const giverId = res.locals.user.userId;
  const recipientId = req.params.userId;
  const hostId = req.params.userId;

  const pointList = await bookingService.findLeaf(giverId, guestId);
  const pointdArray = pointList.map((pointList) => pointList.leaf, pointList.giverId);
  console.log(pointdArray);
  // const point = pointList[1].leaf;
  // const bookingList = await bookingService.checkBooking(guestId, hostId);
  // const booking = bookingList[0].bookingId;
  // console.log(booking, point);

  // try {
  //   const booking_result = await bookingService.cancelBooking(
  //     booking,
  //     point,
  //     guestId,
  //     recipientId,
  //     giverId
  //   );

  //   res.status(200).json({ result: true });
  // } catch (error) {
  //   console.log(error);
  // }
};
exports.cancelBooking = cancelBooking;
