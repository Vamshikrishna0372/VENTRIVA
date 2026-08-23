const express = require('express');
const router = express.Router();
const { getOwnershipHistory } = require('../controllers/ownershipEventController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/investment/:investmentId', getOwnershipHistory);

module.exports = router;
