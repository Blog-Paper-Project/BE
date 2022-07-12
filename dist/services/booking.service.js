const { idText } = require('typescript');
const { User, Booking, Leaf } = require('../../models');
const { findAll } = require('../../models/booking');

//예약시간 조회
const findRev = async (hostId, bookingTime, meetingDate) => {
  return await Booking.findAll({
    where: {
      hostId: hostId,
      time: bookingTime,
      date: meetingDate,
    },
  });
};
exports.findRev = findRev;

//예약 신청
const createBooking = async (userId, guestId, leaf, hostId, bookingTime, meetingDate) => {
  console.log(14, userId, guestId, leaf, hostId, bookingTime, meetingDate);

  await User.decrement({ point: leaf }, { where: { userId: guestId } });
  return await Booking.create({
    hostId,
    date: meetingDate,
    time: bookingTime,
    guestId,
    leaf,
  });
};
exports.createBooking = createBooking;

//게스트(신청자)예약 보기
const inquireBooking = async (userId) => {
  return await Booking.findAll({
    where: { guestId: Number(userId) },
    order: [['createdAt', 'DESC']],
  });
};
exports.inquireBooking = inquireBooking;

//호스트(주최자)예약보기
const hostInquireBooking = async (userId) => {
  return await Booking.findAll({
    where: { hostId: Number(userId) },
    order: [['createdAt', 'DESC']],
  });
};
exports.hostInquireBooking = hostInquireBooking;

//예약 수락
const confirmBooking = async (hostId, bookingId, guestId, leaf) => {
  console.log(hostId, bookingId, guestId, leaf);
  await Leaf.create({
    leaf,
    remarks: '화상채팅 예약',
    giverId: guestId,
    recipientId: hostId,
  });

  await User.increment({ popularity: leaf }, { where: { userId: hostId } });

  await Booking.update(
    { accepted: true },
    {
      where: { bookingId: bookingId },
    }
  );

  return await Booking.findByPk(bookingId);
};
exports.confirmBooking = confirmBooking;

//선택 행 정보찾기
const findOne = async (bookingId) => {
  return await Booking.findAll({
    where: { bookingId },
  });
};
exports.findOne = findOne;

// 게스트 예약 취소
const cancelBooking = async (bookingId, guestId, hostId, leaf) => {
  console.log(bookingId, guestId, hostId, leaf);
  await Booking.update(
    { accepted: false },
    {
      where: { bookingId: bookingId },
    }
  );
  User.increment({ point: leaf }, { where: { userId: hostId } });
  User.decrement({ popularity: leaf }, { where: { userId: guestId } });
  await Leaf.create({
    leaf,
    remarks: '화상채팅 취소',
    giverId: hostId,
    recipientId: guestId,
  });

  return await Booking.findByPk(bookingId);
};
exports.cancelBooking = cancelBooking;
