const express = require('express');
const router = express.Router();
const { recordDecision, getMyDecisions } = require('../controllers/investmentDecisionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor', 'admin'));

router.post('/', recordDecision);
router.get('/', getMyDecisions);

module.exports = router;
