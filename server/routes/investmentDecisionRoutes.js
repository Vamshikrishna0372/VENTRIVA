const express = require('express');
const router = express.Router();
const { recordDecision, getMyDecisions, updateDecision, deleteDecision } = require('../controllers/investmentDecisionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor', 'admin'));

router.post('/', recordDecision);
router.get('/', getMyDecisions);
router.patch('/:id', updateDecision);
router.delete('/:id', deleteDecision);

module.exports = router;

