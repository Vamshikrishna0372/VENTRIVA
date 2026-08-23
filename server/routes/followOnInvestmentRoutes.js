const express = require('express');
const router = express.Router();
const {
  createFollowOnOpportunity,
  getFollowOnOpportunities,
  updateFollowOnStatus,
  convertFollowOnToInvestment,
} = require('../controllers/followOnInvestmentController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

router.use(protect);

router.post('/', authorize('investor', 'admin'), idempotencyMiddleware, createFollowOnOpportunity);
router.get('/', getFollowOnOpportunities);
router.patch('/:id/status', authorize('investor', 'admin'), updateFollowOnStatus);
router.post('/:id/convert', authorize('investor', 'admin'), idempotencyMiddleware, convertFollowOnToInvestment);

module.exports = router;
