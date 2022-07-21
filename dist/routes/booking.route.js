const express = require('express');
const auth = require('../middleware/auth');
const bookingController = require('../controllers/booking.controller');
const router = express.Router();

//나뭇잎 수정
router.patch('/leaf/:userId', auth, bookingController.patchPoint);

//예약 신청
router.post('/:blogId', auth, bookingController.createBooking);

//전체 예약보기
router.get('/', auth, bookingController.bookingList);

//예약 수락 전 예약 취소
//router.delete('/:guestId/:bookingId', auth, bookingController.recall);

//호스트 예약 수락
router.patch('/:hostId/:bookingId', auth, bookingController.acceptBooking);

// 호스트  예약 취소
router.delete('/host/:hostId/:bookingId', auth, bookingController.cancelReservation);

//게스트  예약 취소
router.delete('/guest/:guestId/:bookingId', auth, bookingController.cancelBooking);

router.get('/leaf/:hostId', auth, bookingController.leafList);

module.exports = router;
