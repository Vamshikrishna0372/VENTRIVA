const express = require('express');
const router = express.Router();
const {
  createOrUpdateEvaluation,
  getMyEvaluations,
  getEvaluationByStartup,
  deleteEvaluation,
  getEvaluationAnalytics,
} = require('../controllers/evaluationController');
const { compareStartups } = require('../controllers/comparisonController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor'));

router.post('/', createOrUpdateEvaluation);
router.get('/my', getMyEvaluations);
router.get('/analytics/summary', getEvaluationAnalytics);
router.get('/compare', compareStartups);
router.get('/:startupId', getEvaluationByStartup);
router.delete('/:startupId', deleteEvaluation);

module.exports = router;
