const express = require('express');
const router = express.Router();
const {
  addToShortlist,
  removeFromShortlist,
  getShortlist,
  getShortlistStatus,
} = require('../controllers/shortlistController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('investor'));

router.post('/', addToShortlist);
router.get('/', getShortlist);
router.delete('/:startupId', removeFromShortlist);
router.get('/:startupId/status', getShortlistStatus);

module.exports = router;
