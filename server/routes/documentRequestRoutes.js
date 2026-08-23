const express = require('express');
const router = express.Router();
const {
  createDocumentRequest,
  getDocumentRequests,
  updateDocumentRequest,
} = require('../controllers/documentRequestController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('investor'), createDocumentRequest);
router.get('/', getDocumentRequests);
router.patch('/:id', updateDocumentRequest);

module.exports = router;
