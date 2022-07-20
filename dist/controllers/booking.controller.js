const bookingService = require('../services/booking.service');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul'); // date()함수 공부

//나뭇잎 설정
const setPoint = async (req, res, next) => {
  const { setPoint } = req.body;

  const { userId } = req.params;

  try {
    const point = await bookingService.setPoint(setPoint, userId);
    if (point === false) {
      return res.status(400).send({ result: false });
    }
    return res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.setPoint = setPoint;

const patchPoint = async (req, res, next) => {
  const blogId = req.params.blogId;
  const { setPoint } = req.body;

  try {
    const patchPoint = await bookingService.patchPoint(setPoint, blogId);
    console.log(patchPoint);
    return res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.patchPoint = patchPoint;

//예약 신청
const createBooking = async (req, res, next) => {
  const userId = res.locals.user.userId;

  const { guestId, date } = req.body;
  const Leaf = await bookingService.findLeaf(userId);
  const leaf = Leaf.dataValues.setPoint;
  const blogId = req.params.blogId;

  //날짜, 시간 설정
  const start = date.split('-')[0];
  const end = date.split('-')[1];
  const bookingMoment = new dayjs(); //=> dayjs 사용하려면 현재시간
  const startMoment = dayjs(start); // 예약시작시간
  const time = startMoment.diff(bookingMoment, 'minute');
  const meetingDate = dayjs(startMoment).format('YYYY-MM-DD ddd'); //요일 한국어로 교체
  const startTime = dayjs(start).tz().format('HH:mm:ss');
  const endTime = dayjs(end).tz().format('HH:mm:ss');
  const bookingTime = `${startTime} - ${endTime}`;
  //new dayjs 와 dayjs의 차이점

  console.log(01, userId, guestId, leaf, blogId, bookingTime, meetingDate);

  //예약시간 제한
  if (time < 180) {
    return res.status(400).send({ msg: '화상 채팅 3시간 전까지만 예약이 가능합니다.' });
  }

  // 호스트id, 예약시간, 예약날짜 조회,
  // try catch공부 날카롭다.. ㅎㄷㄷ
  const existRev = await bookingService.findRev(blogId, bookingTime, meetingDate);
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
  if (hostId == guestId) {
    return res.status(400).send({ result: false });
  }
  //커스텀 에러.. 공부

  //예약 신청
  try {
    const booking_result = await bookingService.createBooking(
      userId,
      guestId,
      leaf,
      blogId,
      bookingTime,
      meetingDate
    );
    return res.status(200).json({ booking_result, result: true });
  } catch (error) {
    console.log(error);
    next(error); //next 추가
  }
};
exports.createBooking = createBooking;

// 예약 조회
const bookingList = async (req, res, next) => {
  const userId = res.locals.user.userId;

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

// 호스트 예약 수락
const acceptBooking = async (req, res, next) => {
  const blogId = req.params.blogId;
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
  console.log(hostId, bookingId);
  const guest = await bookingService.findOne(bookingId);
  console.log(guest);
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
  console.log(guestId, bookingId, hostId, leaf);
  try {
    const booking_result = await bookingService.recall(bookingId, guestId, leaf, hostId);
    res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.cancelBooking = cancelBooking;

//예약 수락전 화상채팅 취소
// const recall = async (req, res, next) => {
//   const guestId = req.params.guestId;

//   const bookingId = req.params.bookingId;
//   const host = await bookingService.findOne(bookingId);
//   const hostId = host[0].hostId;
//   const cntLeaf = await bookingService.findOne(bookingId);
//   const leaf = cntLeaf[0].leaf;

//   console.log(bookingId, guestId, leaf, hostId);

//   try {
//     const bookingResult = await bookingService.recall(bookingId, guestId, leaf, hostId);
//     res.status(200).json({ result: true });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
// exports.recall = recall;
