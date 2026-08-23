const express = require('express');
const router = express.Router();
const { getMyActions } = require('../controllers/actionCenterController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/my', getMyActions);

module.exports = router;
