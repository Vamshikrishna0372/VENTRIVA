const mongoose = require('mongoose');
const FundraisingRound = require('../models/FundraisingRound');
const InvestorCommitment = require('../models/InvestorCommitment');

/**
 * Fundraising Analytics Service
 * Provides aggregate calculations and metrics for fundraising rounds without N+1 queries.
 */
class FundraisingAnalyticsService {
  /**
   * Get analytics metrics for a specific fundraising round.
   */
  async getRoundAnalytics(roundId) {
    const objId = typeof roundId === 'string' ? new mongoose.Types.ObjectId(roundId) : roundId;

    const round = await FundraisingRound.findById(objId).lean();
    if (!round) {
      return this.getZeroStateAnalytics();
    }

    // Aggregation pipeline for commitments
    const aggregationResult = await InvestorCommitment.aggregate([
      { $match: { fundraisingRound: objId } },
      {
        $group: {
          _id: '$commitmentStatus',
          count: { $sum: 1 },
          totalRequested: { $sum: '$requestedAmount' },
          totalCommitted: { $sum: '$committedAmount' },
          totalFunded: { $sum: '$fundedAmount' },
          minCommitment: { $min: '$committedAmount' },
          maxCommitment: { $max: '$committedAmount' },
          avgCommitment: { $avg: '$committedAmount' },
        },
      },
    ]);

    const leadInvestorCommitment = await InvestorCommitment.findOne({
      fundraisingRound: objId,
      investorRole: 'Lead Investor',
      commitmentStatus: { $in: ['Committed', 'Soft Committed', 'Funded', 'Term Sheet Proposed'] },
    })
      .populate('investor', 'name email avatar organization')
      .lean();

    let softCommitments = 0;
    let firmCommitments = 0;
    let totalFunded = 0;
    let activeInvestorCount = 0;

    let minTicket = 0;
    let maxTicket = 0;
    let sumTickets = 0;

    aggregationResult.forEach((group) => {
      const status = group._id;
      if (['Soft Committed', 'Interested', 'Due Diligence', 'Term Sheet Proposed'].includes(status)) {
        softCommitments += group.totalCommitted || group.totalRequested || 0;
      }
      if (['Committed', 'Funded'].includes(status)) {
        firmCommitments += group.totalCommitted || 0;
        activeInvestorCount += group.count;
        if (group.minCommitment && (!minTicket || group.minCommitment < minTicket)) {
          minTicket = group.minCommitment;
        }
        if (group.maxCommitment && group.maxCommitment > maxTicket) {
          maxTicket = group.maxCommitment;
        }
        sumTickets += group.totalCommitted || 0;
      }
      if (status === 'Funded') {
        totalFunded += group.totalFunded || 0;
      }
    });

    const targetAmount = round.targetAmount || 0;
    const committedAmount = firmCommitments + (round.committedAmount > firmCommitments ? round.committedAmount - firmCommitments : 0); // fallback or aggregate
    const totalCommittedAndSoft = firmCommitments + softCommitments;
    const remainingAmount = Math.max(0, targetAmount - totalCommittedAndSoft);

    const commitmentPercentage = targetAmount > 0 ? Math.min(100, Number(((totalCommittedAndSoft / targetAmount) * 100).toFixed(2))) : 0;
    const fundingPercentage = targetAmount > 0 ? Math.min(100, Number(((totalFunded / targetAmount) * 100).toFixed(2))) : 0;
    const avgTicket = activeInvestorCount > 0 ? Math.round(firmCommitments / activeInvestorCount) : 0;

    const roundConcentration = firmCommitments > 0 && maxTicket > 0 ? Number(((maxTicket / firmCommitments) * 100).toFixed(2)) : 0;

    return {
      roundId: round._id,
      roundName: round.roundName,
      roundType: round.roundType,
      status: round.status,
      targetAmount,
      softCommitments,
      firmCommitments,
      committedAmount: totalCommittedAndSoft,
      fundedAmount: totalFunded,
      remainingAmount,
      commitmentPercentage,
      fundingPercentage,
      investorCount: activeInvestorCount,
      leadInvestor: leadInvestorCommitment ? leadInvestorCommitment.investor : null,
      averageCommitment: avgTicket,
      minimumCommitment: minTicket,
      maximumCommitment: maxTicket,
      roundConcentration,
      isOversubscribed: totalCommittedAndSoft > targetAmount,
      oversubscriptionAmount: Math.max(0, totalCommittedAndSoft - targetAmount),
    };
  }

  /**
   * Safe Zero State Analytics Response
   */
  getZeroStateAnalytics() {
    return {
      roundId: null,
      roundName: '',
      roundType: '',
      status: 'Draft',
      targetAmount: 0,
      softCommitments: 0,
      firmCommitments: 0,
      committedAmount: 0,
      fundedAmount: 0,
      remainingAmount: 0,
      commitmentPercentage: 0,
      fundingPercentage: 0,
      investorCount: 0,
      leadInvestor: null,
      averageCommitment: 0,
      minimumCommitment: 0,
      maximumCommitment: 0,
      roundConcentration: 0,
      isOversubscribed: false,
      oversubscriptionAmount: 0,
    };
  }
}

module.exports = new FundraisingAnalyticsService();
