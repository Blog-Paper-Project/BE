const express = require('express');
const auth = require('../middleware/auth');
const bookingController = require('../controllers/booking.controller');
const router = express.Router();

//예약 신청
router.post('/:userId', auth, bookingController.createBooking);

//전체 예약보기
router.get('/', auth, bookingController.bookingList);

//나뭇잎 설정
router.patch('leaf/:userId', auth, bookingController.setPoint);

//호스트 예약 수락
router.patch('/:hostId/:bookingId', auth, bookingController.acceptBooking);

// 호스트 예약 취소
router.patch('/host/:hostId/:bookingId', auth, bookingController.cancelReservation);

//게스트 예약 취소
router.patch('/guest/:guestId/:bookingId', auth, bookingController.cancelBooking);

module.exports = router;
