const { idText } = require('typescript');
const { User, Booking, Leaf } = require('../../models');

//예약 신청
const createBooking = async (userId, guestId, leaf, hostId, bookingTime, meetingDate) => {
  console.log(14, userId, guestId, leaf, hostId, bookingTime, meetingDate);

  await User.decrement({ point: `${leaf}` }, { where: { userId: guestId } });

  await User.increment({ popularity: `${leaf}` }, { where: { userId: hostId } });

  await Leaf.create({
    leaf,
    remarks: '화상채팅 예약',
    giverId: guestId,
    recipientId: hostId,
  });

  await Booking.create({
    hostId,
    date: meetingDate,
    time: bookingTime,
    guestId,
  });

  return await Booking.findByPk(guestId);
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

//나뭇잎 찾기
const findLeaf = async (giverId) => {
  return await Leaf.findAll({
    where: { giverId },
    order: [['createdAt', 'DESC']],
  });
};
exports.findLeaf = findLeaf;

const findHost = async (bookingId) => {
  return await Booking.findAll({
    where: { bookingId: bookingId },
  });
};
exports.findHost = findHost;

//예약취소 : 취소 후 나뭇잎 반환
const checkBooking = async (guestId, hostId) => {
  return await Booking.findAll({
    where: {
      guestId: Number(guestId),
      hostId: Number(hostId),
    },
    order: [['createdAt', 'DESC']],
  });
};
exports.checkBooking = checkBooking;

const cancelBooking = async (bookingId, guestId, hostId, giverId, leaf) => {
  console.log(bookingId, guestId, hostId, giverId, leaf);
  await Booking.destroy({
    where: {
      bookingId: bookingId,
    },
  });
  User.increment({ point: Number(...leaf) }, { where: { userId: Number(...hostId) } });
  User.decrement({ popularity: Number(...leaf) }, { where: { userId: guestId } });
  return await Leaf.create({
    leaf: Number(...leaf),
    remarks: '화상채팅 취소',
    giverId: Number(...hostId),
    recipientId: guestId,
  });
};
exports.cancelBooking = cancelBooking;
