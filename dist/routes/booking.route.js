const express = require('express');
const auth = require('../middleware/auth');
const bookingController = require('../controllers/booking.controller');
const router = express.Router();

//예약 신청
router.post('/:userId', auth, bookingController.createBooking);

//게스트(예약자) 가져오기
router.get('/geust/:userId', auth, bookingController.inquireBooking);

//예약 수정
router.patch('/:userId', auth, bookingController.amendBooking);

//호스트(주최자) 기져오기
router.get('/:hostId', auth, bookingController.hostBooking);

//얘약 취소
router.delete('/:userId', auth, bookingController.cancelBooking);

module.exports = router;
