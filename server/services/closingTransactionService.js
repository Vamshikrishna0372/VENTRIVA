const ClosingTransaction = require('../models/ClosingTransaction');
const ActivityLog = require('../models/ActivityLog');
const Investment = require('../models/Investment');
const OwnershipEvent = require('../models/OwnershipEvent');
const Shareholding = require('../models/Shareholding');
const InvestorCommitment = require('../models/InvestorCommitment');
const Notification = require('../models/Notification');
const closingValidationService = require('./closingValidationService');
const capTableEngineService = require('./capTableEngineService');

/**
 * Closing Transaction Service
 * Manages transaction state transitions, closure execution, and post-closing audit record creation.
 */
class ClosingTransactionService {
  /**
   * Execute Transaction Closure workflow
   */
  async closeTransaction(transactionId, actorId) {
    const transaction = await ClosingTransaction.findById(transactionId);
    if (!transaction) throw new Error('Closing transaction not found');

    if (transaction.transactionStatus === 'Closed') {
      return transaction; // Idempotent return if already closed
    }

    if (['Cancelled', 'Failed', 'Expired'].includes(transaction.transactionStatus)) {
      throw new Error(`Cannot close transaction in '${transaction.transactionStatus}' status`);
    }

    // Run strict validation check
    const validation = await closingValidationService.validateTransaction(transactionId);
    if (!validation.isValid) {
      throw new Error(`Transaction closure blocked due to incomplete requirements: ${validation.missingRequirements.join('; ')}`);
    }

    const previousStatus = transaction.transactionStatus;
    transaction.transactionStatus = 'Closed';
    transaction.actualClosingDate = new Date();
    transaction.closedBy = actorId;
    await transaction.save();

    // 1. Finalize Phase 14 Investment Record
    let investment = await Investment.findOne({ investor: transaction.investor, startup: transaction.startup, deal: transaction.deal });
    if (!investment) {
      investment = await Investment.create({
        deal: transaction.deal,
        startup: transaction.startup,
        investor: transaction.investor,
        founder: transaction.founder,
        investmentType: 'Equity',
        investmentStatus: 'Active',
        investmentAmount: transaction.finalInvestmentAmount,
        investmentDate: transaction.actualClosingDate,
        ownershipPercentage: transaction.ownershipPercentage,
        sharesOwned: transaction.sharesIssued,
        sharePrice: transaction.sharePrice,
        preMoneyValuation: transaction.preMoneyValuation,
        postMoneyValuation: transaction.postMoneyValuation,
        currentValuation: transaction.postMoneyValuation,
        currentValue: transaction.finalInvestmentAmount,
        totalInvested: transaction.finalInvestmentAmount,
      });
    } else {
      investment.investmentStatus = 'Active';
      investment.investmentAmount = transaction.finalInvestmentAmount;
      investment.ownershipPercentage = transaction.ownershipPercentage;
      investment.sharesOwned = transaction.sharesIssued;
      investment.sharePrice = transaction.sharePrice;
      await investment.save();
    }

    // 2. Create Phase 15 Ownership Event
    await OwnershipEvent.create({
      startup: transaction.startup,
      investor: transaction.investor,
      investment: investment._id,
      eventType: 'Initial Investment',
      effectiveDate: transaction.actualClosingDate || new Date(),
      newOwnership: transaction.ownershipPercentage || 0,
      reason: `Ownership event created from transaction closing ${transaction._id}`,
      createdBy: actorId,
    });

    // 3. Create Cap Table Snapshot & Update Active Shareholdings
    await capTableEngineService.createSnapshot({
      startupId: transaction.startup,
      transactionId: transaction._id,
      createdById: actorId,
      preMoneyValuation: transaction.preMoneyValuation,
      investmentAmount: transaction.finalInvestmentAmount,
    });

    await Shareholding.findOneAndUpdate(
      { startup: transaction.startup, holder: transaction.investor },
      {
        startup: transaction.startup,
        holder: transaction.investor,
        holderName: 'Investor Holding',
        holderType: 'Investor',
        shares: transaction.sharesIssued,
        ownershipPercentage: transaction.ownershipPercentage,
        shareClass: transaction.shareClass,
        acquisitionCost: transaction.finalInvestmentAmount,
        acquisitionDate: transaction.actualClosingDate,
        active: true,
      },
      { upsert: true, new: true }
    );

    // 4. Update Investor Commitment Status to Funded if linked
    if (transaction.commitment) {
      await InvestorCommitment.findByIdAndUpdate(transaction.commitment, {
        commitmentStatus: 'Funded',
        fundedAmount: transaction.finalInvestmentAmount,
        fundedAt: transaction.actualClosingDate,
      });
    }

    // 5. Record Immutable Closing Activity Audit Log
    await ActivityLog.create({
      activityType: 'closing',
      closingTransaction: transaction._id,
      startup: transaction.startup,
      actor: actorId,
      action: 'TRANSACTION_CLOSED',
      description: `Transaction closed successfully for $${transaction.finalInvestmentAmount.toLocaleString()} (${transaction.ownershipPercentage}% ownership)`,
      metadata: { previousStatus, newStatus: 'Closed', finalInvestmentAmount: transaction.finalInvestmentAmount, sharesIssued: transaction.sharesIssued },
    });

    // 6. Notify Participants
    await Notification.create({
      user: transaction.founder,
      type: 'System',
      title: 'Investment Transaction Closed!',
      message: `The transaction with investment of $${transaction.finalInvestmentAmount.toLocaleString()} has successfully closed. Cap table and portfolio updated.`,
      relatedEntityType: 'ClosingTransaction',
      relatedEntityId: transaction._id,
    });

    await Notification.create({
      user: transaction.investor,
      type: 'System',
      title: 'Investment Transaction Closed!',
      message: `Your investment of $${transaction.finalInvestmentAmount.toLocaleString()} in the venture has closed. Shareholding recorded.`,
      relatedEntityType: 'ClosingTransaction',
      relatedEntityId: transaction._id,
    });

    return transaction;
  }

  /**
   * Record Closing Activity Audit Event
   */
  async recordActivity({ transactionId, startupId, actorId, action, description, previousStatus = '', newStatus = '', metadata = {} }) {
    try {
      await ActivityLog.create({
        activityType: 'closing',
        closingTransaction: transactionId,
        startup: startupId,
        actor: actorId,
        action,
        description,
        metadata: { ...metadata, previousStatus, newStatus },
      });
    } catch (err) {
      console.error('Failed to log closing activity:', err.message);
    }
  }
}

module.exports = new ClosingTransactionService();
