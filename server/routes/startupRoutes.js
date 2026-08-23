const express = require('express');
const router = express.Router();
const {
  createStartup,
  getStartups,
  getMyStartup,
  getMyStartupById,
  updateMyStartup,
  deleteMyStartup,
} = require('../controllers/startupController');
const {
  addTeamMember,
  getTeamMembers,
  updateTeamMember,
  deleteTeamMember,
} = require('../controllers/teamController');
const {
  discoverStartups,
  getStartupDetailForInvestor,
} = require('../controllers/discoveryController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const { getMyStartupReadiness } = require('../controllers/readinessController');

// Base Authentication for all startup endpoints
router.use(protect);

// Investor Discovery Routes (guarded with authorize('investor'))
router.get('/discover', authorize('investor'), discoverStartups);
router.get('/discover/:id', authorize('investor'), getStartupDetailForInvestor);

// Founder Startup CRUD Routes (guarded with authorize('founder'))
router.post('/', authorize('founder'), createStartup);
router.get('/', authorize('founder'), getStartups);
router.get('/my', authorize('founder'), getMyStartup);
router.get('/my/readiness', authorize('founder'), getMyStartupReadiness);
router.get('/my/:id', authorize('founder'), getMyStartupById);
router.put('/my/:id', authorize('founder'), updateMyStartup);
router.delete('/my/:id', authorize('founder'), deleteMyStartup);

// Founder Startup Team Routes (guarded with authorize('founder'))
router.post('/my/:startupId/team', authorize('founder'), addTeamMember);
router.get('/my/:startupId/team', authorize('founder'), getTeamMembers);
router.put('/my/:startupId/team/:memberId', authorize('founder'), updateTeamMember);
router.delete('/my/:startupId/team/:memberId', authorize('founder'), deleteTeamMember);

module.exports = router;
