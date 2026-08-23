const express = require('express');
const router = express.Router();
const {
  getDueDiligenceChecklist,
  updateChecklistItem,
  getMyDueDiligenceWorkspaces,
} = require('../controllers/dueDiligenceController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/my', authorize('investor'), getMyDueDiligenceWorkspaces);
router.get('/:startupId', authorize('investor'), getDueDiligenceChecklist);
router.patch('/:startupId/items/:itemId', authorize('investor'), updateChecklistItem);

module.exports = router;
