const express = require('express');
const router = express.Router();
const { createExitTransaction, getExitTransactions, completeExitTransaction } = require('../controllers/exitController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

router.use(protect);

router.post('/', authorize('investor', 'admin'), idempotencyMiddleware, createExitTransaction);
router.get('/', getExitTransactions);
router.post('/:id/complete', authorize('investor', 'admin'), idempotencyMiddleware, completeExitTransaction);

module.exports = router;
