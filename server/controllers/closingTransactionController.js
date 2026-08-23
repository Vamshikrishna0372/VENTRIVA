const ClosingTransaction = require('../models/ClosingTransaction');
const ClosingCondition = require('../models/ClosingCondition');
const LegalDocument = require('../models/LegalDocument');
const SignatureRecord = require('../models/SignatureRecord');
const PaymentRecord = require('../models/PaymentRecord');
const ActivityLog = require('../models/ActivityLog');
const Startup = require('../models/Startup');
const InvestorCommitment = require('../models/InvestorCommitment');
const Deal = require('../models/Deal');
const closingValidationService = require('../services/closingValidationService');
const closingTransactionService = require('../services/closingTransactionService');
const capTableEngineService = require('../services/capTableEngineService');

/**
 * Create a new Closing Transaction
 */
exports.createTransaction = async (req, res, next) => {
  try {
    const {
      startupId,
      investorId,
      commitmentId,
      dealId,
      termSheetId,
      fundraisingRoundId,
      finalInvestmentAmount,
      preMoneyValuation,
      shareClass,
      expectedClosingDate,
    } = req.body;

    const startup = await Startup.findById(startupId || req.body.startup);
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString() && req.user._id.toString() !== investorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to initiate closing for this venture' });
    }

    const amount = Number(finalInvestmentAmount);
    const preMoney = Number(preMoneyValuation || startup.valuation || 5000000);

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Final investment amount must be greater than zero' });
    }

    const equity = capTableEngineService.calculateTransactionEquity({
      preMoneyValuation: preMoney,
      investmentAmount: amount,
    });

    const transaction = await ClosingTransaction.create({
      fundraisingRound: fundraisingRoundId || null,
      deal: dealId || null,
      termSheet: termSheetId || null,
      startup: startup._id,
      founder: startup.founder,
      investor: investorId || req.user._id,
      commitment: commitmentId || null,
      transactionType: req.body.transactionType || 'Priced Equity Round',
      transactionStatus: 'Pending',
      committedAmount: amount,
      finalInvestmentAmount: amount,
      agreedValuation: preMoney,
      preMoneyValuation: preMoney,
      postMoneyValuation: equity.postMoneyValuation,
      ownershipPercentage: equity.ownershipPercentage,
      sharePrice: equity.sharePrice,
      sharesIssued: equity.sharesIssued,
      shareClass: shareClass || 'Preferred Stock - Seed',
      expectedClosingDate: expectedClosingDate ? new Date(expectedClosingDate) : null,
      createdBy: req.user._id,
    });

    // Create Default Required Closing Conditions
    await ClosingCondition.insertMany([
      { transaction: transaction._id, title: 'Share Subscription Agreement Execution', category: 'Legal', required: true, responsibleParty: 'Mutual' },
      { transaction: transaction._id, title: 'Board & Shareholder Resolution Approval', category: 'Corporate', required: true, responsibleParty: 'Founder' },
      { transaction: transaction._id, title: 'KYC & AML Compliance Verification', category: 'Compliance', required: true, responsibleParty: 'Investor' },
      { transaction: transaction._id, title: 'Wire Transfer Payment Confirmation', category: 'Payment', required: true, responsibleParty: 'Investor' },
    ]);

    // Create Default Required Legal Documents
    await LegalDocument.insertMany([
      { transaction: transaction._id, documentType: 'Share Subscription Agreement', documentName: 'Share Subscription Agreement v1.0', uploadedBy: req.user._id, required: true },
      { transaction: transaction._id, documentType: 'Shareholders Agreement', documentName: 'Shareholders Agreement v1.0', uploadedBy: req.user._id, required: true },
      { transaction: transaction._id, documentType: 'Board Resolution', documentName: 'Board Approval Resolution', uploadedBy: req.user._id, required: true },
    ]);

    // Create Default Payment Record
    await PaymentRecord.create({
      transaction: transaction._id,
      investor: transaction.investor,
      expectedAmount: amount,
      paymentStatus: 'Pending',
    });

    // Audit log
    await closingTransactionService.recordActivity({
      transactionId: transaction._id,
      startupId: transaction.startup,
      actorId: req.user._id,
      action: 'CLOSING_INITIATED',
      description: `Initiated closing transaction for $${amount.toLocaleString()} (${equity.ownershipPercentage}% ownership)`,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List closing transactions
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const { status, startupId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let filter = {};

    if (req.user.role === 'founder') {
      filter.founder = req.user._id;
    } else if (req.user.role === 'investor') {
      filter.investor = req.user._id;
    }

    if (status) filter.transactionStatus = status;
    if (startupId) filter.startup = startupId;

    const total = await ClosingTransaction.countDocuments(filter);
    const transactions = await ClosingTransaction.find(filter)
      .populate('startup', 'startupName logo tagline sector')
      .populate('founder', 'name email avatar')
      .populate('investor', 'name email avatar organization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get individual transaction workspace detail
 */
exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await ClosingTransaction.findById(req.params.id)
      .populate('startup', 'startupName logo tagline sector stage valuation ARR')
      .populate('founder', 'name email avatar organization')
      .populate('investor', 'name email avatar organization')
      .lean();

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Closing transaction not found' });
    }

    // Access authorization check
    if (
      req.user.role !== 'admin' &&
      transaction.founder._id.toString() !== req.user._id.toString() &&
      transaction.investor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied to this transaction' });
    }

    // Retrieve related transaction components
    const [conditions, legalDocuments, payment, activity, validation] = await Promise.all([
      ClosingCondition.find({ transaction: transaction._id }).sort({ required: -1, createdAt: 1 }).lean(),
      LegalDocument.find({ transaction: transaction._id }).lean(),
      PaymentRecord.findOne({ transaction: transaction._id }).lean(),
      ActivityLog.find({ closingTransaction: transaction._id }).populate('actor', 'name email role').sort({ createdAt: -1 }).limit(30).lean(),
      closingValidationService.validateTransaction(transaction._id),
    ]);

    // Retrieve signatures for documents
    const documentsWithSignatures = await Promise.all(
      legalDocuments.map(async (doc) => {
        const signatures = await SignatureRecord.find({ document: doc._id }).populate('signer', 'name email role').lean();
        return { ...doc, signatures };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        ...transaction,
        conditions,
        legalDocuments: documentsWithSignatures,
        payment,
        activity,
        validation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update transaction terms & parameters
 */
exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await ClosingTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (
      req.user.role !== 'admin' &&
      transaction.founder.toString() !== req.user._id.toString() &&
      transaction.investor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update transaction' });
    }

    if (['Closed', 'Cancelled', 'Failed'].includes(transaction.transactionStatus)) {
      return res.status(400).json({ success: false, message: `Cannot modify transaction in '${transaction.transactionStatus}' status` });
    }

    const { finalInvestmentAmount, preMoneyValuation, shareClass, expectedClosingDate } = req.body;

    if (finalInvestmentAmount !== undefined || preMoneyValuation !== undefined) {
      const amount = Number(finalInvestmentAmount !== undefined ? finalInvestmentAmount : transaction.finalInvestmentAmount);
      const preMoney = Number(preMoneyValuation !== undefined ? preMoneyValuation : transaction.preMoneyValuation);

      const equity = capTableEngineService.calculateTransactionEquity({
        preMoneyValuation: preMoney,
        investmentAmount: amount,
      });

      transaction.finalInvestmentAmount = amount;
      transaction.preMoneyValuation = preMoney;
      transaction.postMoneyValuation = equity.postMoneyValuation;
      transaction.ownershipPercentage = equity.ownershipPercentage;
      transaction.sharePrice = equity.sharePrice;
      transaction.sharesIssued = equity.sharesIssued;
    }

    if (shareClass) transaction.shareClass = shareClass;
    if (expectedClosingDate) transaction.expectedClosingDate = new Date(expectedClosingDate);

    await transaction.save();

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update transaction status state machine
 */
exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { targetStatus } = req.body;
    const transaction = await ClosingTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

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
      Failed: [],
    };

    const allowed = validTransitions[transaction.transactionStatus] || [];
    if (!allowed.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transaction status transition from '${transaction.transactionStatus}' to '${targetStatus}'`,
      });
    }

    const previousStatus = transaction.transactionStatus;

    if (targetStatus === 'Closed') {
      const closedTx = await closingTransactionService.closeTransaction(transaction._id, req.user._id);
      return res.status(200).json({ success: true, data: closedTx });
    }

    transaction.transactionStatus = targetStatus;
    await transaction.save();

    await closingTransactionService.recordActivity({
      transactionId: transaction._id,
      startupId: transaction.startup,
      actorId: req.user._id,
      action: 'STATUS_UPDATED',
      description: `Transaction status changed from ${previousStatus} to ${targetStatus}`,
      previousStatus,
      newStatus: targetStatus,
    });

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate transaction readiness
 */
exports.validateTransactionReadiness = async (req, res, next) => {
  try {
    const validation = await closingValidationService.validateTransaction(req.params.id);
    res.status(200).json({ success: true, data: validation });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete and close transaction
 */
exports.completeTransaction = async (req, res, next) => {
  try {
    const transaction = await closingTransactionService.closeTransaction(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
