const express = require('express');
const router = express.Router();
const { getMyStrategy, saveStrategy } = require('../controllers/investorStrategyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor', 'admin'));

router.get('/', getMyStrategy);
router.post('/', saveStrategy);

module.exports = router;
