const { idText } = require('typescript');
const { User, Booking, Leaf } = require('../../models');

//예약 신청
const createBooking = async (userId, date, time, guestId, leaf, hostId) => {
  console.log(userId, date, time, guestId);

  await Booking.create({
    hostId: userId,
    date,
    time,
    guestId,
  });

  return await Booking.findByPk(guestId);
};
exports.createBooking = createBooking;

//게스트(신청자)예약 보기
const inquireBooking = async (guestId) => {
  return await Booking.findAll({
    where: { guestId: Number(guestId) },
    order: [['createdAt', 'DESC']],
  });
};
exports.inquireBooking = inquireBooking;

//호스트(주최자)예약보기
const hostInquireBooking = async (hostId) => {
  return await Booking.findAll({
    where: { hostId: Number(hostId) },
    order: [['createdAt', 'DESC']],
  });
};
exports.hostInquireBooking = hostInquireBooking;

//예약 수정
// const changeBooking = async (date, time, bookingId) => {
//   console.log(date, time, bookingId);
//   await Booking.update(
//     {
//       date,
//       time,
//     },
//     { where: { bookingId: Number(bookingId) } }
//   );
//   return await Booking.findByPk(bookingId);
// };
// exports.changeBooking = changeBooking;

//예약 수락
const findGuest = async (hostId, guestId, bookingId) => {
  return await Booking.findByPk({ where: { guestId: guestId } });
};
exports.findGuest = findGuest;

const confirmBooking = async (guestId, hostId, bookingId) => {
  await Booking.update(
    {
      accepted: true,
    },
    { where: { hostId: hostId } }
  );

  return await Booking.findByPk(hostId);
};
exports.confirmBooking = confirmBooking;

// await User.decrement({ point: `${leaf}` }, { where: { userId: guestId } });

// await User.increment({ popularity: `${leaf}` }, { where: { userId: hostId } });

// await Leaf.create({
//   leaf,
//   remarks: '화상채팅 예약',
//   giverId: guestId,
//   recipientId: hostId,
// });

//얘약 취소 : 나뭇잎 찾기
const findLeaf = async (giverId) => {
  return await Leaf.findAll({
    where: { giverId },
    order: [['createdAt', 'DESC']],
  });
};
exports.findLeaf = findLeaf;

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

const cancelBooking = async (booking, point, guestId, recipientId, giverId) => {
  await Booking.destroy({
    where: {
      bookingId: Number(booking),
    },
    limit: 1,
  });
  User.increment({ point: point }, { where: { userId: guestId } });

  User.decrement({ popularity: point }, { where: { userId: recipientId } });

  return await Leaf.create({
    leaf: point,
    remarks: '화상채팅 취소',
    giverId: recipientId,
    recipientId: giverId,
  });
};
exports.cancelBooking = cancelBooking;
