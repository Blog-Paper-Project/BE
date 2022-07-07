const express = require('express');
const auth = require('../middleware/auth');
const bookingController = require('../controllers/booking.controller');
const router = express.Router();

//예약 신청
router.post('/:userId', auth, bookingController.createBooking);

//게스트(예약자) 가져오기
router.get('/guest/:userId', auth, bookingController.inquireBooking);

//호스트(주최자) 기져오기
router.get('/:hostId', auth, bookingController.hostBooking);

//예약 수락
router.patch('/:hostId', auth, bookingController.accpetBooking);

//예약거절
//router.patch('/reject/:userId', auth, bookingController.rejectBooking);

//얘약 취소
router.patch('/:userId', auth, bookingController.cancelBooking);

module.exports = router;
