const express = require('express');
const router = express.Router();
const { getFounderProfile, updateFounderProfile } = require('../controllers/founderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('founder'));

router.get('/me', getFounderProfile);
router.put('/me', updateFounderProfile);

module.exports = router;
