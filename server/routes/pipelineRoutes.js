const express = require('express');
const router = express.Router();
const {
  createOrUpdatePipeline,
  getMyPipelines,
  getPipelineByStartup,
  updatePipelineStage,
  deletePipeline,
  getPipelineAnalytics,
} = require('../controllers/pipelineController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor'));

router.post('/', createOrUpdatePipeline);
router.get('/', getMyPipelines);
router.get('/analytics/summary', getPipelineAnalytics);
router.get('/:startupId', getPipelineByStartup);
router.patch('/:startupId/stage', updatePipelineStage);
router.delete('/:startupId', deletePipeline);

module.exports = router;
