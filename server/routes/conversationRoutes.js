const express = require('express');
const router = express.Router();
const {
  getMyConversations,
  getConversationById,
  archiveConversation,
  blockConversation,
  markConversationRead,
} = require('../controllers/conversationController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMyConversations);
router.get('/:id', getConversationById);
router.patch('/:id/archive', archiveConversation);
router.patch('/:id/block', blockConversation);
router.patch('/:id/read', markConversationRead);

module.exports = router;
