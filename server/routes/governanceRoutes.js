const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

const shareholderController = require('../controllers/shareholderController');
const boardController = require('../controllers/boardController');
const boardMeetingController = require('../controllers/boardMeetingController');
const boardResolutionController = require('../controllers/boardResolutionController');
const governanceVoteController = require('../controllers/governanceVoteController');
const corporateActionController = require('../controllers/corporateActionController');
const shareTransferController = require('../controllers/shareTransferController');
const equityPoolController = require('../controllers/equityPoolController');
const governanceRightController = require('../controllers/governanceRightController');
const complianceController = require('../controllers/complianceController');
const governanceController = require('../controllers/governanceController');

router.use(protect);

// -------------------------------------------------------------
// SHAREHOLDER & BOARD ROUTES
// -------------------------------------------------------------
router.route('/shareholders').get(shareholderController.getShareholders).post(idempotencyMiddleware, shareholderController.addShareholder);
router.route('/board').get(boardController.getBoardMembers).post(boardController.addBoardMember);
router.delete('/board/:id', boardController.removeBoardMember);

// -------------------------------------------------------------
// BOARD MEETINGS & RESOLUTIONS & VOTING ROUTES
// -------------------------------------------------------------
router.route('/board-meetings').get(boardMeetingController.getMeetings).post(idempotencyMiddleware, boardMeetingController.scheduleMeeting);
router.patch('/board-meetings/:id/status', boardMeetingController.updateMeetingStatus);

router.route('/board-resolutions').get(boardResolutionController.getResolutions).post(idempotencyMiddleware, boardResolutionController.proposeResolution);
router.post('/board-resolutions/:resolutionId/vote', governanceVoteController.castVote);

// -------------------------------------------------------------
// CORPORATE ACTIONS & SHARE TRANSFERS & EQUITY POOLS
// -------------------------------------------------------------
router.route('/corporate-actions').get(corporateActionController.getCorporateActions).post(corporateActionController.proposeCorporateAction);

router.route('/share-transfers').get(shareTransferController.getTransfers).post(idempotencyMiddleware, shareTransferController.proposeTransfer);
router.post('/share-transfers/:id/execute', shareTransferController.executeTransfer);

router.route('/equity-pools').get(equityPoolController.getEquityPools);
router.post('/equity-pools/:id/allocate', equityPoolController.allocatePoolShares);

// -------------------------------------------------------------
// GOVERNANCE RIGHTS & COMPLIANCE & ACTIVITY AUDIT
// -------------------------------------------------------------
router.get('/governance-rights', governanceRightController.getGovernanceRights);

router.route('/compliance').get(complianceController.getComplianceItems).post(complianceController.addComplianceItem);
router.patch('/compliance/:id/status', complianceController.updateComplianceStatus);

router.get('/governance-activity', governanceController.getGovernanceActivity);

// -------------------------------------------------------------
// ADMIN GOVERNANCE OVERSIGHT
// -------------------------------------------------------------
router.get('/admin/governance/analytics', authorize('admin'), governanceController.getAdminGovernanceAnalytics);

module.exports = router;
