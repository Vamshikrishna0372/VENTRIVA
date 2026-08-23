const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

const transactionController = require('../controllers/closingTransactionController');
const conditionController = require('../controllers/closingConditionController');
const legalDocController = require('../controllers/legalDocumentController');
const paymentController = require('../controllers/paymentRecordController');
const capTableController = require('../controllers/capTableController');
const adminController = require('../controllers/adminClosingController');

router.use(protect);

// -------------------------------------------------------------
// CLOSING TRANSACTION ROUTES
// -------------------------------------------------------------
router
  .route('/closings')
  .post(idempotencyMiddleware, transactionController.createTransaction)
  .get(transactionController.getTransactions);

router
  .route('/closings/:id')
  .get(transactionController.getTransactionById)
  .patch(transactionController.updateTransaction);

router.post('/closings/:id/status', transactionController.updateTransactionStatus);
router.get('/closings/:id/validate', transactionController.validateTransactionReadiness);
router.post('/closings/:id/complete', transactionController.completeTransaction);

// -------------------------------------------------------------
// CLOSING CONDITIONS & LEGAL DOCUMENTS & PAYMENT ROUTES
// -------------------------------------------------------------
router.post('/closings/:id/conditions', conditionController.addCondition);
router.patch('/closings/conditions/:conditionId', conditionController.updateConditionStatus);

router.post('/closings/:id/documents', legalDocController.addDocument);
router.patch('/closings/documents/:docId/status', legalDocController.updateDocumentStatus);
router.post('/closings/documents/:docId/sign', legalDocController.signDocument);

router.post('/closings/:id/payment', paymentController.submitPayment);
router.post('/closings/payment/:paymentId/verify', paymentController.verifyPayment);

// -------------------------------------------------------------
// CAP TABLE ROUTES
// -------------------------------------------------------------
router.get('/cap-table/:startupId', capTableController.getCapTable);
router.get('/cap-table/:startupId/history', capTableController.getCapTableHistory);

// -------------------------------------------------------------
// ADMIN GOVERNANCE ROUTES
// -------------------------------------------------------------
router.get('/admin/closings/transactions', authorize('admin'), adminController.getAdminTransactions);
router.get('/admin/closings/analytics', authorize('admin'), adminController.getAdminClosingAnalytics);

module.exports = router;
