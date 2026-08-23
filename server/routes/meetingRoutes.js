const express = require('express');
const router = express.Router();
const {
  requestMeeting,
  getMyMeetings,
  getMeetingById,
  confirmMeeting,
  declineMeeting,
  cancelMeeting,
  completeMeeting,
} = require('../controllers/meetingController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', requestMeeting);
router.get('/', getMyMeetings);
router.get('/:id', getMeetingById);
router.patch('/:id/confirm', confirmMeeting);
router.patch('/:id/decline', declineMeeting);
router.patch('/:id/cancel', cancelMeeting);
router.patch('/:id/complete', completeMeeting);

module.exports = router;
