const express = require('express');
const router = express.Router();
const { calculateScenario, getSavedScenarios } = require('../controllers/portfolioScenarioController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor', 'admin'));

router.post('/calculate', calculateScenario);
router.get('/', getSavedScenarios);

module.exports = router;
