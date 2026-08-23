const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markMessageRead,
} = require('../controllers/messageController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);
router.patch('/:messageId/read', markMessageRead);

module.exports = router;
