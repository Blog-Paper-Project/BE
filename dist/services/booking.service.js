const { User, Booking, Leaf, Point } = require('../../models');

//나뭇잎 설정
const setPoint = async (setLeaf, userId) => {
  console.log(setLeaf, userId);
  return await Point.create({
    userId: userId,
    setPoint: setLeaf,
  });
};
exports.setPoint = setPoint;

const patchPoint = async (setLeaf, userId) => {
  return await Point.update(
    { setPoint: setLeaf },
    {
      where: {
        userId: userId,
      },
    }
  );
};
exports.patchPoint = patchPoint;

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

//예약한 내역
const guestBooking = async (userId) => {
  return await Booking.findAll({
    where: { guestId: Number(userId) },
    order: [['createdAt', 'DESC']],
  });
};
exports.guestBooking = guestBooking;

//예약받은 내역
const hostBooking = async (userId) => {
  return await Booking.findAll({
    where: { hostId: Number(userId) },
    order: [['createdAt', 'DESC']],
  });
};
exports.hostBooking = hostBooking;

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
