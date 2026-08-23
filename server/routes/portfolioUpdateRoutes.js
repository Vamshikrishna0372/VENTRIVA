const express = require('express');
const router = express.Router();
const {
  submitPortfolioUpdate,
  getUpdatesForInvestment,
  acknowledgePortfolioUpdate,
} = require('../controllers/portfolioUpdateController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

router.use(protect);

router.post('/', authorize('founder', 'admin'), idempotencyMiddleware, submitPortfolioUpdate);
router.get('/investment/:investmentId', getUpdatesForInvestment);
router.post('/:id/acknowledge', authorize('investor', 'admin'), acknowledgePortfolioUpdate);

module.exports = router;
