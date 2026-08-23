const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadDocument,
  getDocumentsByStartup,
  downloadDocument,
  uploadDocumentVersion,
  getDocumentVersions,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');

const { protect } = require('../middleware/authMiddleware');

// In-memory Multer storage for buffer processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max limit
});

router.use(protect);

router.post('/', upload.single('file'), uploadDocument);
router.get('/startup/:startupId', getDocumentsByStartup);
router.get('/:documentId/download', downloadDocument);
router.post('/:documentId/version', upload.single('file'), uploadDocumentVersion);
router.get('/:documentId/versions', getDocumentVersions);
router.patch('/:documentId', updateDocument);
router.delete('/:documentId', deleteDocument);

module.exports = router;
