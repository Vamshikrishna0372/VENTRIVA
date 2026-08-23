const express = require('express');
const router = express.Router();
const {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} = require('../controllers/availabilityController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAvailability);
router.post('/', authorize('founder'), createAvailability);
router.put('/:id', authorize('founder'), updateAvailability);
router.delete('/:id', authorize('founder'), deleteAvailability);

module.exports = router;
