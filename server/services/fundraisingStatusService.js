const FundraisingRound = require('../models/FundraisingRound');
const InvestorCommitment = require('../models/InvestorCommitment');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

/**
 * Fundraising Status Service
 * Handles deterministic round status progression and audit activity recording.
 */
class FundraisingStatusService {
  /**
   * Recalculate round totals and evaluate status transitions
   */
  async updateRoundProgress(roundId, actorId) {
    const round = await FundraisingRound.findById(roundId);
    if (!round) return null;

    // Aggregate commitments
    const commitments = await InvestorCommitment.find({
      fundraisingRound: roundId,
      commitmentStatus: { $in: ['Committed', 'Soft Committed', 'Funded', 'Term Sheet Proposed'] },
    });

    let totalCommitted = 0;
    let totalFunded = 0;

    commitments.forEach((c) => {
      if (['Committed', 'Soft Committed', 'Term Sheet Proposed'].includes(c.commitmentStatus)) {
        totalCommitted += c.committedAmount || c.requestedAmount || 0;
      }
      if (c.commitmentStatus === 'Funded') {
        totalFunded += c.fundedAmount || c.committedAmount || 0;
        totalCommitted += c.fundedAmount || c.committedAmount || 0;
      }
    });

    round.committedAmount = totalCommitted;
    round.fundedAmount = totalFunded;

    let previousStatus = round.status;
    let newStatus = previousStatus;

    // Deterministic state progression rules (if not draft, closed, or cancelled)
    if (!['Draft', 'Closed', 'Cancelled', 'Closing'].includes(round.status)) {
      if (round.committedAmount >= round.targetAmount && round.targetAmount > 0) {
        if (round.committedAmount > round.targetAmount) {
          newStatus = 'Soft Commitments'; // or Oversubscribed indicator
        } else {
          newStatus = 'Soft Commitments';
        }
      }
    }

    if (previousStatus !== newStatus && newStatus !== 'Draft') {
      round.status = newStatus;
      await this.recordActivity({
        fundraisingRound: round._id,
        startup: round.startup,
        founder: round.founder,
        actor: actorId || round.founder,
        action: 'ROUND_STATUS_UPDATED',
        description: `Round status updated from ${previousStatus} to ${newStatus}`,
        metadata: { previousStatus, newStatus, totalCommitted, targetAmount: round.targetAmount },
      });
    }

    await round.save();
    return round;
  }

  /**
   * Transition Round Status explicitly with validation
   */
  async transitionStatus(roundId, targetStatus, actorId, reason = '') {
    const round = await FundraisingRound.findById(roundId);
    if (!round) throw new Error('Fundraising round not found');

    const validTransitions = {
      Draft: ['Open', 'Cancelled'],
      Open: ['Soft Commitments', 'In Due Diligence', 'Term Sheet Stage', 'Closing', 'Closed', 'Cancelled'],
      'Soft Commitments': ['In Due Diligence', 'Term Sheet Stage', 'Closing', 'Closed', 'Cancelled'],
      'In Due Diligence': ['Term Sheet Stage', 'Closing', 'Closed', 'Cancelled'],
      'Term Sheet Stage': ['Closing', 'Closed', 'Cancelled'],
      Closing: ['Closed', 'Cancelled'],
      Closed: [],
      Cancelled: [],
    };

    const allowed = validTransitions[round.status] || [];
    if (!allowed.includes(targetStatus)) {
      throw new Error(`Invalid round status transition from '${round.status}' to '${targetStatus}'`);
    }

    const previousStatus = round.status;
    round.status = targetStatus;

    if (targetStatus === 'Open' && !round.openingDate) {
      round.openingDate = new Date();
    }
    if (targetStatus === 'Closed') {
      round.actualClosingDate = new Date();
    }

    round.updatedBy = actorId;
    await round.save();

    // Log activity
    await this.recordActivity({
      fundraisingRound: round._id,
      startup: round.startup,
      founder: round.founder,
      actor: actorId,
      action: `ROUND_${targetStatus.toUpperCase().replace(/\s+/g, '_')}`,
      description: `Fundraising round '${round.roundName}' transitioned from ${previousStatus} to ${targetStatus}${reason ? `: ${reason}` : ''}`,
      metadata: { previousStatus, targetStatus, reason },
    });

    // Notify founder if triggered by admin or system
    if (actorId.toString() !== round.founder.toString()) {
      await Notification.create({
        user: round.founder,
        type: 'RoundStatusChange',
        title: `Round Status Updated`,
        message: `Your round "${round.roundName}" status has been changed to ${targetStatus}.`,
        relatedEntityType: 'FundraisingRound',
        relatedEntityId: round._id,
      });
    }

    return round;
  }

  /**
   * Helper to log immutable activity
   */
  async recordActivity({ fundraisingRound, startup, investor, founder, actor, action, targetType = 'FundraisingRound', targetId = null, description, metadata = {} }) {
    try {
      await ActivityLog.create({
        activityType: 'fundraising',
        fundraisingRound,
        startup,
        actor,
        action,
        description,
        metadata: { ...metadata, investor, founder, targetType, targetId },
      });
    } catch (err) {
      console.error('Failed to log fundraising activity:', err.message);
    }
  }
}

module.exports = new FundraisingStatusService();
