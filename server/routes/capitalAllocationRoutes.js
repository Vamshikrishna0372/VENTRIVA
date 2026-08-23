const express = require('express');
const router = express.Router();
const { saveAllocationPlan, getAllocationPlans } = require('../controllers/capitalAllocationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

router.use(protect);
router.use(authorize('investor', 'admin'));

router.post('/', idempotencyMiddleware, saveAllocationPlan);
router.get('/', getAllocationPlans);

module.exports = router;
