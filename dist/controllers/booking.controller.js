const bookingService = require('../services/booking.service');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const locale = require('dayjs/locale/ko');
dayjs.locale('ko');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

//나뭇잎 설정
const patchPoint = async (req, res, next) => {
  const userId = req.params.userId;
  const { setPoint } = req.body;

  try {
    const patchPoint = await bookingService.patchPoint(setPoint, userId);
    return res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.patchPoint = patchPoint;

//예약 신청
const createBooking = async (req, res, next) => {
  const guestId = res.locals.user.blogId;
  const userId = res.locals.user.userId;

  const { blogId, date } = req.body;
  const Leaf = await bookingService.findLeaf(blogId);
  const leaf = Leaf[0].dataValues.setPoint;
  const hostId = req.params.blogId;

  //날짜, 시간 설정
  const start = date.split('-')[0];
  const end = date.split('-')[1];
  const bookingMoment = new dayjs(); //=> dayjs 사용하려면 현재시간
  const startMoment = dayjs(start); // 예약시작시간
  const time = startMoment.diff(bookingMoment, 'minute');
  const meetingDate = dayjs(startMoment).format('YYYY-MM-DD dddd'); //요일 한국어로 교체
  const startTime = dayjs(start).tz().format('HH:mm:ss');
  const endTime = dayjs(end).tz().format('HH:mm:ss');
  const bookingTime = `${startTime} - ${endTime}`;

  //예약 신청 횟수 제한
  const bookingList = await bookingService.findList(guestId);
  if (bookingList.length > 11) {
    return res.send.status(400).send({ msg: '예약횟수를 초과하였습니다.' });
  }

  // 예약 받는 횟수 제한
  const hostBbookingList = await bookingService.hostFindList(hostId);
  if (hostBbookingList.length > 11) {
    return res.send.status(400).send({ msg: '예약 받을 수 있는 횟수를 초과하였습니다.' });
  }

  //예약시간 제한
  if (time < 180) {
    return res.status(400).send({ msg: '화상 채팅 3시간 전까지만 예약이 가능합니다.' });
  }

  // 호스트id, 예약시간, 예약날짜 조회,

  const existRev = await bookingService.findRev(hostId, bookingTime, meetingDate);
  if (existRev.length > 0) {
    return res.status(400).send({ msg: '이미 예약된 시간 입니다.' });
  }

  // 유저 나뭇잎 조회
  //나중에 바꿀것
  const userPoint = res.locals.user.point;
  if (userPoint < 5) {
    return res.status(400).send({ msg: '나뭇잎이 부족합니다.' });
  }

  //포인트 음수 차단
  const availablePoint = userPoint - leaf;
  if (availablePoint < 0) {
    return res.status(400).send({ msg: '가지고 있는 나뭇잎이 부족합니다.' });
  }

  //본인 예약 차단
  if (blogId == hostId) {
    return res.status(400).send({ result: false });
  }

  if (blogId === undefined || date === undefined) {
    return res.status(400).send({ result: false });
  }

  //예약 신청
  try {
    const bookingResult = await bookingService.createBooking(
      blogId,
      leaf,
      bookingTime,
      meetingDate,
      hostId,
      userId
    );
    return res.status(200).json({ bookingResult, result: true });
  } catch (error) {
    console.log(error);
    next(error); //next 추가
  }
};
exports.createBooking = createBooking;

// 예약 조회
const bookingList = async (req, res, next) => {
  const userId = res.locals.user.userId;
  const blogId = res.locals.user.blogId;

  try {
    const hostBookingList = await bookingService.hostBooking(blogId);
    const guestBookingList = await bookingService.guestBooking(blogId);
    const totalList = { hostBookingList, guestBookingList };
    return res.status(200).json({ totalList, result: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.bookingList = bookingList;

//유저 나뭇잎 보여주기
const leafList = async (req, res, next) => {
  const hostId = req.params.hostId;
  try {
    const gusetLeaf = res.locals.user.point;
    const hostLeaf = await bookingService.findHost(hostId);
    const pointList = { gusetLeaf, hostLeaf };
    return res.status(200).json({ pointList });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.leafList = leafList;

// 호스트 예약 수락
const acceptBooking = async (req, res, next) => {
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
    next(error);
  }
};
exports.acceptBooking = acceptBooking;

// 호스트 예약 취소
const cancelReservation = async (req, res, next) => {
  const hostId = req.params.hostId;
  const bookingId = req.params.bookingId;
  const guest = await bookingService.findOne(bookingId);
  const guestId = guest[0].guestId;
  const cntLeaf = await bookingService.findOne(bookingId);
  const leaf = cntLeaf[0].leaf;

  try {
    const booking_result = await bookingService.cancelBooking(
      bookingId,
      guestId,
      hostId,
      leaf
    );
    res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.cancelReservation = cancelReservation;

// 게스트  예약 취소
const cancelBooking = async (req, res, next) => {
  const guestId = req.params.guestId;
  const bookingId = req.params.bookingId;
  const host = await bookingService.findOne(bookingId);
  const hostId = host[0].hostId;
  const cntLeaf = await bookingService.findOne(bookingId);
  const leaf = cntLeaf[0].leaf;

  try {
    const booking_result = await bookingService.recall(bookingId, guestId, hostId, leaf);
    res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.cancelBooking = cancelBooking;
