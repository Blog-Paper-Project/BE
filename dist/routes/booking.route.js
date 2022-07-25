const express = require('express');
const auth = require('../middlewares/auth');
const bookingController = require('../controllers/booking.controller');
const asyncHandler = require('../middlewares/async.handler');
const router = express.Router();

//나뭇잎 수정
router.patch('/leaf/:userId', auth, asyncHandler(bookingController.patchPoint));

//예약 신청
router.post('/:blogId', auth, asyncHandler(bookingController.createBooking));

//전체 예약보기
router.get('/', auth, asyncHandler(bookingController.bookingList));

//호스트 예약 수락
router.patch('/:hostId/:bookingId', auth, asyncHandler(bookingController.acceptBooking));

// 호스트  예약 취소
router.delete(
  '/host/:hostId/:bookingId',
  auth,
  asyncHandler(bookingController.cancelReservation)
);

//게스트  예약 취소
router.delete(
  '/guest/:guestId/:bookingId',
  auth,
  asyncHandler(bookingController.cancelBooking)
);

//나뭇잎 보기
router.get('/leaf/:hostId', auth, asyncHandler(bookingController.leafList));

module.exports = router;
