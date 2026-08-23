const express = require('express');
const router = express.Router();
const { recordPerformanceSnapshot, getPerformanceForInvestment } = require('../controllers/portfolioPerformanceController');

const { protect } = require('../middleware/authMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

router.use(protect);

router.post('/', idempotencyMiddleware, recordPerformanceSnapshot);
router.get('/investment/:investmentId', getPerformanceForInvestment);

module.exports = router;
