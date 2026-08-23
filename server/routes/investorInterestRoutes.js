const express = require('express');
const router = express.Router();
const {
  expressInterest,
  getMyInterests,
  getStartupInterests,
  respondToInterest,
  withdrawInterest,
} = require('../controllers/investorInterestController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('investor'), expressInterest);
router.get('/my', authorize('investor'), getMyInterests);
router.get('/startup/:startupId', getStartupInterests);
router.patch('/:id/respond', respondToInterest);
router.patch('/:id/withdraw', authorize('investor'), withdrawInterest);

module.exports = router;
