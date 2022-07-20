const { User, Booking, Leaf } = require('../../models');

//나뭇잎 설정
const patchPoint = async (setPoint, userId) => {
  await User.update(
    { setPoint: setPoint },
    {
      where: {
        userId: userId,
      },
    }
  );
  return await User.findByPk(userId);
};
exports.patchPoint = patchPoint;

//나뭇잎 조회
const findLeaf = async (blogId) => {
  return await User.findOne({
    where: {
      blogId: blogId,
    },
  });
};
exports.findLeaf = findLeaf;

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
const createBooking = async (blogId, guestId, leaf, bookingTime, meetingDate, hostId) => {
  console.log('**', blogId, guestId, leaf, bookingTime, meetingDate, hostId);
  await User.decrement({ point: leaf }, { where: { userId: guestId } });
  await Leaf.create({
    leaf,
    remarks: '화상채팅 예약',
    giverId: guestId,
    recipientId: hostId,
  });
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
    where: { guestId: userId },
    order: [['createdAt', 'DESC']],
  });
};
exports.guestBooking = guestBooking;

//예약받은 내역
const hostBooking = async (userId) => {
  return await Booking.findAll({
    where: { hostId: userId },
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
    where: { bookingId: bookingId },
  });
};
exports.findOne = findOne;

// 화상채팅 수락 후 예약 취소
const cancelBooking = async (bookingId, guestId, hostId, leaf) => {
  console.log(bookingId, guestId, hostId, leaf);
  await Booking.destroy({
    where: { bookingId: bookingId },
  });
  User.increment({ point: leaf }, { where: { userId: guestId } });
  User.decrement({ popularity: leaf }, { where: { userId: hostId } });
  await Leaf.create({
    leaf,
    remarks: '화상채팅 취소',
    giverId: hostId,
    recipientId: guestId,
  });

  return await Booking.findByPk(bookingId);
};
exports.cancelBooking = cancelBooking;

// 수락전 예약 취소
const recall = async (bookingId, guestId, hostId, leaf) => {
  console.log(bookingId, guestId, hostId, leaf);
  await Booking.destroy({
    where: { bookingId: bookingId },
  });
  User.increment({ point: leaf }, { where: { userId: guestId } });
  await Leaf.create({
    leaf,
    remarks: '화상채팅 수락 전 취소',
    giverId: hostId,
    recipientId: guestId,
  });

  return await Booking.findByPk(bookingId);
};
exports.recall = recall;
