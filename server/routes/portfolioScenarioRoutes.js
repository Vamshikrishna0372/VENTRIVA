const express = require('express');
const router = express.Router();
const { calculateScenario, getSavedScenarios, deleteScenario } = require('../controllers/portfolioScenarioController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor', 'admin'));

router.post('/calculate', calculateScenario);
router.get('/', getSavedScenarios);
router.delete('/:id', deleteScenario);

module.exports = router;
