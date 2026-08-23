const express = require('express');
const router = express.Router();
const {
  createDealFromPipeline,
  getMyDeals,
  getDealById,
  updateDealStatus,
  archiveDeal,
} = require('../controllers/dealController');

const {
  proposeTermSheet,
  getTermSheetsForDeal,
  acceptTermSheet,
  declineTermSheet,
  withdrawTermSheet,
} = require('../controllers/termSheetController');

const {
  createMilestone,
  getMilestonesForDeal,
  updateMilestoneStatus,
  deleteMilestone,
} = require('../controllers/dealMilestoneController');

const { getDealActivities } = require('../controllers/dealActivityController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

router.use(protect);

// Deal Room CRUD
router.post('/', authorize('investor'), idempotencyMiddleware, createDealFromPipeline);
router.get('/', getMyDeals);
router.get('/:id', getDealById);
router.patch('/:id/status', updateDealStatus);
router.patch('/:id/archive', archiveDeal);

// Term Sheets Sub-routes
router.post('/:dealId/term-sheets', idempotencyMiddleware, proposeTermSheet);
router.get('/:dealId/term-sheets', getTermSheetsForDeal);
router.patch('/:dealId/term-sheets/:id/accept', acceptTermSheet);
router.patch('/:dealId/term-sheets/:id/decline', declineTermSheet);
router.patch('/:dealId/term-sheets/:id/withdraw', withdrawTermSheet);

// Closing Milestones Sub-routes
router.post('/:dealId/milestones', createMilestone);
router.get('/:dealId/milestones', getMilestonesForDeal);
router.patch('/:dealId/milestones/:id', updateMilestoneStatus);
router.delete('/:dealId/milestones/:id', deleteMilestone);

// Deal Activity Timeline Sub-route
router.get('/:dealId/activities', getDealActivities);

module.exports = router;
