const bookingService = require('../services/booking.service');
require('moment-timezone');
const dayjs = require('dayjs');
const moment = require('moment');
moment.tz.setDefault('Asia/Seoul');

//예약 신청
const createBooking = async (req, res) => {
  const userId = res.locals.user.userId;
  const { leaf, guestId, date } = req.body;
  const hostId = req.params.userId;

  //날짜, 시간 설정
  const start = date.split('-')[0];
  const end = date.split('-')[1];
  const bookingMoment = new dayjs();
  const startMoment = dayjs(start);
  const time = moment.duration(startMoment.diff(bookingMoment)).asMinutes();
  const meetingMoment = dayjs(start);
  const meetingDate = dayjs(meetingMoment).format('YYYY-MM-DD ddd');
  const startTime = dayjs(start).format('HH:mm:ss');
  const endTime = dayjs(end).format('HH:mm:ss');
  const bookingTime = `${startTime} - ${endTime}`;

  // console.log(userId, guestId, leaf, hostId, bookingTime, meetingDate);
  // 예약 테이블 조회
  const existRev = await bookingService.findRev(hostId, bookingTime, meetingDate);
  const existRevCnt = existRev.map((v) => v.bookingId);
  const userPoint = res.locals.user.point;

  if (
    existRev[0].dataValues.date === meetingDate &&
    existRev[0].dataValues.time === bookingTime
  ) {
    return res.send({ msg: '이미 예약되었습니다.' });
  }
  if (userPoint < 10) {
    return res.send({ msg: '나뭇잎이 부족합니다.' });
  }
  if (existRevCnt.length > 2) {
    return res.send({ msg: '금일 예약횟수를 초과했습니다.' });
  }
  if (time < 180) {
    res.status(400).send({ msg: '화상 채팅 3시간 전까지만 예약이 가능합니다.' });
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
    return res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.createBooking = createBooking;

//예약 조회
const inquireBooking = async (req, res) => {
  const guestId = res.locals.user.userId;
  const userId = res.locals.user.userId;
  const status = await bookingService.findstaus(guestId);
  const recentSatus = status.map((v) => v.accepted);

  try {
    const inquireResult = await bookingService.inquireBooking(userId);
    const hostResult = await bookingService.hostInquireBooking(userId);
    return res.status(200).json({ inquireResult, hostResult, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.inquireBooking = inquireBooking;

// 호스트 예약 수락
const acceptBooking = async (req, res) => {
  const hostId = req.params.hostId;
  const bookingId = req.params.bookingId;
  const guest = await bookingService.findOne(bookingId);
  const guestId = guest[0].guestId;
  const cntLeaf = await bookingService.findOne(bookingId);
  const leaf = cntLeaf[0].leaf;
  console.log(hostId, bookingId, guestId, leaf);
  try {
    const acceptBooking = await bookingService.confirmBooking(
      hostId,
      bookingId,
      guestId,
      leaf
    );
    return res.status(200).json({ acceptBooking, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.acceptBooking = acceptBooking;

// 호스트 예약 취소
const cancelReservation = async (req, res) => {
  const hostId = req.params.hostId;
  const bookingId = req.params.bookingId;
  const guest = await bookingService.findOne(bookingId);
  const guestId = guest[0].guestId;
  const cntLeaf = await bookingService.findOne(bookingId);
  const leaf = cntLeaf[0].leaf;

  console.log(guestId, bookingId, hostId, leaf);
  try {
    const booking_result = await bookingService.cancelBooking(
      bookingId,
      guestId,
      leaf,
      hostId
    );
    res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.cancelReservation = cancelReservation;

// 게스트 예약 취소
const cancelBooking = async (req, res) => {
  const guestId = req.params.guestId;
  const bookingId = req.params.bookingId;
  const host = await bookingService.findOne(bookingId);
  const hostId = host[0].hostId;
  const cntLeaf = await bookingService.findOne(bookingId);
  const leaf = cntLeaf[0].leaf;
  console.log(guestId, bookingId, hostId, leaf);
  try {
    const booking_result = await bookingService.cancelBooking(
      bookingId,
      guestId,
      leaf,
      hostId
    );
    res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
  }
};
exports.cancelBooking = cancelBooking;
