const ClosingTransaction = require('../models/ClosingTransaction');
const ClosingCondition = require('../models/ClosingCondition');
const LegalDocument = require('../models/LegalDocument');
const SignatureRecord = require('../models/SignatureRecord');
const PaymentRecord = require('../models/PaymentRecord');

/**
 * Closing Validation Engine Service
 * Automatically validates all legal, financial, condition, and signature requirements before transaction closure.
 */
class ClosingValidationService {
  /**
   * Perform comprehensive transaction closure validation
   */
  async validateTransaction(transactionId) {
    const transaction = await ClosingTransaction.findById(transactionId).lean();
    if (!transaction) {
      return { isValid: false, missingRequirements: ['Transaction not found'] };
    }

    const missingRequirements = [];

    // 1. Validate Financial Amounts
    if (!transaction.finalInvestmentAmount || transaction.finalInvestmentAmount <= 0) {
      missingRequirements.push('Final investment amount must be greater than zero');
    }
    if (transaction.ownershipPercentage < 0 || transaction.ownershipPercentage > 100) {
      missingRequirements.push('Ownership percentage must be between 0% and 100%');
    }

    // 2. Validate Closing Conditions
    const pendingConditions = await ClosingCondition.find({
      transaction: transactionId,
      required: true,
      status: { $nin: ['Completed', 'Waived'] },
    }).lean();

    if (pendingConditions.length > 0) {
      missingRequirements.push(
        `${pendingConditions.length} required closing condition(s) pending completion: ${pendingConditions.map((c) => c.title).join(', ')}`
      );
    }

    // 3. Validate Legal Documents
    const pendingDocuments = await LegalDocument.find({
      transaction: transactionId,
      required: true,
      status: { $nin: ['Approved', 'Signed'] },
    }).lean();

    if (pendingDocuments.length > 0) {
      missingRequirements.push(
        `${pendingDocuments.length} required legal document(s) pending approval: ${pendingDocuments.map((d) => d.documentName).join(', ')}`
      );
    }

    // 4. Validate Signatures (Founder & Investor)
    const requiredDocuments = await LegalDocument.find({ transaction: transactionId, required: true }).lean();
    for (const doc of requiredDocuments) {
      const founderSig = await SignatureRecord.findOne({ document: doc._id, signerRole: 'Founder', status: 'Signed' });
      const investorSig = await SignatureRecord.findOne({ document: doc._id, signerRole: 'Investor', status: 'Signed' });

      if (!founderSig) {
        missingRequirements.push(`Founder signature missing for document '${doc.documentName}'`);
      }
      if (!investorSig) {
        missingRequirements.push(`Investor signature missing for document '${doc.documentName}'`);
      }
    }

    // 5. Validate Payment Status
    const payment = await PaymentRecord.findOne({ transaction: transactionId });
    if (!payment || !['Verified', 'Received'].includes(payment.paymentStatus)) {
      missingRequirements.push('Investment payment has not been verified or received');
    }

    const isValid = missingRequirements.length === 0;

    return {
      transactionId,
      isValid,
      missingRequirements,
      status: transaction.transactionStatus,
    };
  }
}

module.exports = new ClosingValidationService();
