const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

const roundController = require('../controllers/fundraisingRoundController');
const commitmentController = require('../controllers/investorCommitmentController');
const inviteController = require('../controllers/fundraisingInviteController');
const adminController = require('../controllers/adminFundraisingController');

// All routes require authentication
router.use(protect);

// -------------------------------------------------------------
// FUNDRAISING ROUND ROUTES
// -------------------------------------------------------------
router
  .route('/fundraising-rounds')
  .post(idempotencyMiddleware, roundController.createRound)
  .get(roundController.getRounds);

router
  .route('/fundraising-rounds/:id')
  .get(roundController.getRoundById)
  .patch(roundController.updateRound);

router.post('/fundraising-rounds/:id/open', roundController.openRound);
router.post('/fundraising-rounds/:id/close', roundController.closeRound);
router.post('/fundraising-rounds/:id/cancel', roundController.cancelRound);
router.get('/fundraising-rounds/:id/analytics', roundController.getRoundAnalytics);

// Document & Milestone & Notes links
router.post('/fundraising-rounds/:id/documents', roundController.linkDocument);
router.post('/fundraising-rounds/:id/milestones', roundController.addMilestone);
router.route('/fundraising-rounds/:id/notes').post(roundController.addNote).get(roundController.getNotes);

// -------------------------------------------------------------
// INVESTOR COMMITMENT ROUTES
// -------------------------------------------------------------
router
  .route('/fundraising-rounds/:roundId/commitments')
  .post(idempotencyMiddleware, commitmentController.createCommitment)
  .get(commitmentController.getCommitmentsForRound);

router
  .route('/commitments/:id')
  .get(commitmentController.getCommitmentById)
  .patch(commitmentController.updateCommitment);

router.post('/commitments/:id/accept', commitmentController.acceptCommitment);
router.post('/commitments/:id/decline', commitmentController.declineCommitment);
router.post('/commitments/:id/withdraw', commitmentController.withdrawCommitment);
router.post('/commitments/:id/mark-funded', commitmentController.markFunded);
router.post('/commitments/:id/open-deal-room', commitmentController.openDealRoomForCommitment);

// -------------------------------------------------------------
// FUNDRAISING INVITATION ROUTES
// -------------------------------------------------------------
router.get('/fundraising-invites/my-invites', authorize('investor', 'admin'), inviteController.getMyInvites);

router
  .route('/fundraising-rounds/:roundId/invites')
  .post(idempotencyMiddleware, inviteController.createInvite)
  .get(inviteController.getInvitesForRound);

router.post('/fundraising-invites/:id/accept', inviteController.acceptInvite);
router.post('/fundraising-invites/:id/decline', inviteController.declineInvite);
router.post('/fundraising-invites/:id/withdraw', inviteController.withdrawInvite);

// -------------------------------------------------------------
// ADMIN GOVERNANCE ROUTES
// -------------------------------------------------------------
router.get('/admin/fundraising/rounds', authorize('admin'), adminController.getAdminRounds);
router.get('/admin/fundraising/analytics', authorize('admin'), adminController.getAdminFundraisingAnalytics);
router.get('/admin/fundraising/activity', authorize('admin'), adminController.getAdminFundraisingActivity);

module.exports = router;
