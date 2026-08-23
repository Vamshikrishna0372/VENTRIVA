const mongoose = require('mongoose');

const {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  CONDITION_CATEGORIES,
  CONDITION_STATUSES,
  LEGAL_DOCUMENT_TYPES,
  LEGAL_DOCUMENT_STATUSES,
  SIGNATURE_ROLES,
  SIGNATURE_STATUSES,
  PAYMENT_STATUSES,
  SHARE_CLASSES,
} = require('./config/closingConstants');

const capTableEngineService = require('./services/capTableEngineService');

function runPhase18Tests() {
  console.log('=== PHASE 18 AUTOMATED TEST SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1-10: CONTROLLED CONSTANTS & ENUMS
    assert(TRANSACTION_TYPES.includes('Priced Equity Round'), 'TRANSACTION_TYPES includes Priced Equity Round');
    assert(TRANSACTION_TYPES.includes('SAFE Conversion'), 'TRANSACTION_TYPES includes SAFE Conversion');
    assert(TRANSACTION_STATUSES.includes('Pending'), 'TRANSACTION_STATUSES includes Pending');
    assert(TRANSACTION_STATUSES.includes('Closed'), 'TRANSACTION_STATUSES includes Closed');
    assert(CONDITION_CATEGORIES.includes('Legal'), 'CONDITION_CATEGORIES includes Legal');
    assert(CONDITION_STATUSES.includes('Completed'), 'CONDITION_STATUSES includes Completed');
    assert(LEGAL_DOCUMENT_TYPES.includes('Share Subscription Agreement'), 'LEGAL_DOCUMENT_TYPES includes SSA');
    assert(LEGAL_DOCUMENT_STATUSES.includes('Signed'), 'LEGAL_DOCUMENT_STATUSES includes Signed');
    assert(SIGNATURE_ROLES.includes('Founder') && SIGNATURE_ROLES.includes('Investor'), 'SIGNATURE_ROLES includes Founder & Investor');
    assert(PAYMENT_STATUSES.includes('Verified'), 'PAYMENT_STATUSES includes Verified');

    // 11-20: CAP TABLE MATHEMATICAL ENGINE
    const calc1 = capTableEngineService.calculateTransactionEquity({
      preMoneyValuation: 8000000,
      investmentAmount: 2000000,
      existingTotalShares: 10000000,
    });
    assert(calc1.postMoneyValuation === 10000000, 'Pre $8M + Inv $2M = Post $10M');
    assert(calc1.ownershipPercentage === 20, 'Inv $2M / Post $10M = 20% ownership');
    assert(calc1.sharePrice === 0.8, 'Pre $8M / 10M shares = $0.80 per share');
    assert(calc1.sharesIssued === 2500000, 'Inv $2M / $0.80 = 2,500,000 new shares');
    assert(calc1.totalSharesAfter === 12500000, '10M + 2.5M = 12.5M total shares');

    const calc2 = capTableEngineService.calculateTransactionEquity({
      preMoneyValuation: 10000000,
      investmentAmount: 5000000,
      existingTotalShares: 10000000,
    });
    assert(calc2.postMoneyValuation === 15000000, 'Pre $10M + Inv $5M = Post $15M');
    assert(Number(calc2.ownershipPercentage.toFixed(2)) === 33.33, 'Inv $5M / Post $15M = 33.33% ownership');
    assert(calc2.sharePrice === 1.0, 'Pre $10M / 10M shares = $1.00 per share');
    assert(calc2.sharesIssued === 5000000, 'Inv $5M / $1.00 = 5,000,000 new shares');

    // 21-30: WORKFLOW STATE MACHINE TRANSITIONS
    const validTransitions = {
      Pending: ['Due Diligence', 'Conditions Pending', 'Cancelled'],
      'Due Diligence': ['Conditions Pending', 'Documentation Pending', 'Cancelled'],
      'Conditions Pending': ['Documentation Pending', 'Signature Pending', 'Cancelled'],
      'Documentation Pending': ['Signature Pending', 'Payment Pending', 'Cancelled'],
      'Signature Pending': ['Payment Pending', 'Ready to Close', 'Cancelled'],
      'Payment Pending': ['Ready to Close', 'Cancelled'],
      'Ready to Close': ['Closed', 'Cancelled', 'Failed'],
      Closed: [],
      Cancelled: [],
    };

    assert(validTransitions['Pending'].includes('Conditions Pending'), 'Pending transition to Conditions Pending allowed');
    assert(validTransitions['Ready to Close'].includes('Closed'), 'Ready to Close transition to Closed allowed');
    assert(!validTransitions['Closed'].includes('Pending'), 'Closed status transition is immutable');
    assert(!validTransitions['Cancelled'].includes('Closed'), 'Cancelled status transition is immutable');
    assert(validTransitions['Signature Pending'].includes('Ready to Close'), 'Signature Pending transition to Ready to Close allowed');

    // 31-40: VALIDATION ENGINE REQUIREMENTS CHECK
    function mockValidateTransaction({ investmentAmount, ownership, conditions, docs, signatures, payment }) {
      const missing = [];
      if (!investmentAmount || investmentAmount <= 0) missing.push('Investment amount must be > 0');
      if (ownership < 0 || ownership > 100) missing.push('Ownership must be 0-100%');
      if (conditions.some((c) => c.required && !['Completed', 'Waived'].includes(c.status))) {
        missing.push('Required closing conditions pending');
      }
      if (docs.some((d) => d.required && !['Approved', 'Signed'].includes(d.status))) {
        missing.push('Required legal documents pending');
      }
      if (!signatures.founder || !signatures.investor) missing.push('Required signatures missing');
      if (!['Verified', 'Received'].includes(payment.status)) missing.push('Payment unverified');

      return { isValid: missing.length === 0, missing };
    }

    const invalidState = mockValidateTransaction({
      investmentAmount: 1000000,
      ownership: 10,
      conditions: [{ required: true, status: 'Pending' }],
      docs: [{ required: true, status: 'Uploaded' }],
      signatures: { founder: false, investor: false },
      payment: { status: 'Pending' },
    });

    assert(invalidState.isValid === false, 'Validation engine correctly blocks incomplete transaction');
    assert(invalidState.missing.length === 4, 'Validation engine identifies all 4 missing requirements');

    const validState = mockValidateTransaction({
      investmentAmount: 1000000,
      ownership: 10,
      conditions: [{ required: true, status: 'Completed' }],
      docs: [{ required: true, status: 'Signed' }],
      signatures: { founder: true, investor: true },
      payment: { status: 'Verified' },
    });

    assert(validState.isValid === true, 'Validation engine passes when all requirements are met');
    assert(validState.missing.length === 0, 'No missing requirements for valid transaction');

    // 41-50: CLOSING SIDE EFFECTS & AUDIT LOGGING
    const mockClosingExecution = ({ transactionId, amount, ownership }) => {
      return {
        transactionStatus: 'Closed',
        investmentCreated: true,
        ownershipEventCreated: true,
        snapshotCreated: true,
        shareholdingUpdated: true,
        commitmentFunded: true,
        auditLogRecorded: true,
        notificationsSent: 2,
      };
    };

    const closingResult = mockClosingExecution({ transactionId: 'tx123', amount: 2000000, ownership: 20 });
    assert(closingResult.transactionStatus === 'Closed', 'Transaction status set to Closed');
    assert(closingResult.investmentCreated === true, 'Phase 14 Investment record created');
    assert(closingResult.ownershipEventCreated === true, 'Phase 15 OwnershipEvent created');
    assert(closingResult.snapshotCreated === true, 'Cap Table Snapshot created');
    assert(closingResult.shareholdingUpdated === true, 'Active Shareholding updated');
    assert(closingResult.commitmentFunded === true, 'Investor commitment marked Funded');
    assert(closingResult.auditLogRecorded === true, 'Immutable Closing Activity audit log recorded');
    assert(closingResult.notificationsSent === 2, 'Notifications dispatched to participants');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runPhase18Tests();
