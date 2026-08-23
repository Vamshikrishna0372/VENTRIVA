const express = require('express');
const router = express.Router();
const {
  createInvestmentFromDeal,
  getMyInvestments,
  getInvestmentById,
  getPortfolioAnalyticsEndpoint,
  updateInvestmentStatus,
} = require('../controllers/investmentController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

router.use(protect);

router.post('/from-deal/:dealId', authorize('investor'), idempotencyMiddleware, createInvestmentFromDeal);
router.get('/', getMyInvestments);
router.get('/my-investments', getMyInvestments);
router.get('/my', getMyInvestments);
router.get('/portfolio/analytics', getPortfolioAnalyticsEndpoint);
router.get('/:id', getInvestmentById);
router.patch('/:id/status', authorize('investor', 'admin'), updateInvestmentStatus);

module.exports = router;
