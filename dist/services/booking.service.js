const exp = require('constants');
const { User, Booking, Leaf } = require('../../models');

//예약 신청
const createBooking = async (userId, date, time, guestId, leaf) => {
  await User.decrement({ point: `${leaf}` }, { where: { userId: guestId } });

  await User.increment({ point: `${leaf}` }, { where: { userId } });

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
  });
};
exports.inquireBooking = inquireBooking;

//예약 수정
const changeBooking = async (date, time, guestId) => {
  return await Booking.update(
    {
      date,
      time,
    },
    {
      where: { guestId: Number(guestId) },
    }
  );
};
exports.changeBooking = changeBooking;

// 예약수정 : 수정값 보여주기
const findBooking = async (guestId) => {
  return await Booking.findAll({
    where: { guestId: Number(guestId) },
  });
};
exports.findBooking = findBooking;

//얘약 취소 : 나뭇잎 찾기
const findLeaf = async (giverId) => {
  return await Leaf.findAll({
    where: { giverId },
    order: [['createdAt', 'DESC']],
  });
};
exports.findLeaf = findLeaf;

//예약취소 : 취소 후 나뭇잎 반환
const cancelBooking = async (point, guestId, recipientId, hostId, giverId) => {
  await Booking.destroy({
    where: { guestId: Number(guestId), hostId: Number(hostId) },
    order: [['createdAt', 'DESC']],
  });
  User.increment({ point: point.leaf }, { where: { userId: guestId } });

  User.decrement({ point: point.leaf }, { where: { userId: recipientId } });

  return await Leaf.create({
    leaf: point,
    remarks: '화상채팅 취소',
    giverId: recipientId,
    recipientId: giverId,
  });
};
exports.cancelBooking = cancelBooking;
