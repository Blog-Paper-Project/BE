const { User, Booking, Leaf } = require('../../models');

//예약 신청
const createBooking = async (userId, date, time, guestId, leaf, hostId) => {
  console.log(userId, date, time, guestId, leaf);
  await User.decrement({ point: `${leaf}` }, { where: { userId: guestId } });

  await User.increment({ popularity: `${leaf}` }, { where: { userId: hostId } });

  await Leaf.create({
    leaf,
    remarks: '화상채팅 예약',
    giverId: guestId,
    recipientId: userId,
  });

  return await Booking.create({
    hostId: userId,
    date,
    time,
    guestId,
  });
};
exports.createBooking = createBooking;

//예약 보기
const inquireBooking = async (guestId) => {
  return await Booking.findAll({
    where: { guestId: Number(guestId) },
    order: [['createdAt', 'DESC']],
  });
};
exports.inquireBooking = inquireBooking;

//예약 수정
const changeBooking = async (date, time, bookingId) => {
  console.log(date, time, bookingId);
  await Booking.update(
    {
      date,
      time,
    },
    { where: { bookingId: Number(bookingId) } }
  );
  return await Booking.findByPk(bookingId);
};
exports.changeBooking = changeBooking;

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
