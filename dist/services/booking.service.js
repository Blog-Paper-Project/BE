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
  return await User.findAll({
    where: {
      blogId: blogId,
    },
  });
};
exports.findLeaf = findLeaf;

//예약시간 조회
const findRev = async (hostId, start, end) => {
  return await Booking.findAll({
    where: {
      hostId: hostId,
      start,
      end,
    },
  });
};
exports.findRev = findRev;

//예약 신청
const createBooking = async (blogId, leaf, start, end, hostId, userId, endTime) => {
  console.log(blogId, hostId);
  await User.decrement({ point: leaf }, { where: { userId: userId } });
  await Leaf.create({
    leaf,
    remarks: '화상채팅 예약',
    giverId: blogId,
    recipientId: hostId,
  });
  return await Booking.create({
    hostId,
    start,
    end,
    guestId: blogId,
    leaf,
    endTime,
  });
};
exports.createBooking = createBooking;

//예약한 내역
const guestBooking = async (blogId) => {
  return await Booking.findAll({
    where: { guestId: blogId },
    order: [['createdAt', 'DESC']],
  });
};
exports.guestBooking = guestBooking;

//예약받은 내역
const hostBooking = async (blogId) => {
  return await Booking.findAll({
    where: { hostId: blogId },
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

  await User.increment({ popularity: leaf }, { where: { blogId: hostId } });

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

// 예약 신청 횟수 제한
const findList = async (guestId) => {
  return await Booking.findAll({
    where: { guestId: guestId },
  });
};
exports.findList = findList;

//예약 신청 횟수 제한
const hostFindList = async (hostId) => {
  return await Booking.findAll({
    where: { hostId: hostId },
  });
};
exports.hostFindList = hostFindList;

const findHost = async (hostId) => {
  return await User.findAll({
    attributes: [
      'setPoint',
      'blogId',
      'profileImage',
      'introduction',
      'popularity',
      'nickname',
    ],
    where: { blogId: hostId },
  });
};
exports.findHost = findHost;

// 화상채팅 수락 후 예약 취소
const cancelBooking = async (bookingId, guestId, hostId, leaf) => {
  console.log(bookingId, guestId, hostId, leaf);
  User.increment({ point: leaf }, { where: { blogId: guestId } });
  User.decrement({ popularity: leaf }, { where: { blogId: hostId } });
  await Leaf.create({
    leaf,
    remarks: '화상채팅 취소',
    giverId: hostId,
    recipientId: guestId,
  });

  await Booking.destroy({
    where: { bookingId: bookingId },
  });
  return await Booking.findByPk(bookingId);
};
exports.cancelBooking = cancelBooking;

// 수락전 예약 취소
const recall = async (bookingId, guestId, hostId, leaf) => {
  await Booking.destroy({
    where: { bookingId: bookingId },
  });
  User.increment({ point: leaf }, { where: { blogId: guestId } });
  await Leaf.create({
    leaf,
    remarks: '화상채팅 수락 전 취소',
    giverId: hostId,
    recipientId: guestId,
  });

  return await Booking.findByPk(bookingId);
};
exports.recall = recall;
