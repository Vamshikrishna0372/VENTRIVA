const BoardResolution = require('../models/BoardResolution');
const GovernanceVote = require('../models/GovernanceVote');
const BoardMember = require('../models/BoardMember');
const Shareholder = require('../models/Shareholder');
const governanceService = require('./governanceService');

class VotingService {
  /**
   * Calculate server-side voting power for a user on a resolution
   */
  async calculateVotingPower({ resolution, userId }) {
    const Startup = require('../models/Startup');
    const Investment = require('../models/Investment');

    const startup = await Startup.findById(resolution.startup);
    if (startup && startup.founder.toString() === userId.toString()) {
      return 1;
    }

    if (resolution.resolutionType === 'Board Vote' || resolution.meeting) {
      const boardMember = await BoardMember.findOne({ startup: resolution.startup, user: userId, status: 'Active' });
      if (boardMember) {
        if (boardMember.role === 'Observer') return 0;
        return boardMember.votingPower || 1;
      }
      // If user has an active investment or shareholding in the venture, grant board voting power = 1
      const investment = await Investment.findOne({ startup: resolution.startup, investor: userId, investmentStatus: 'Active' });
      if (investment) return 1;
      return 0;
    } else {
      // Shareholder vote: voting power based on persisted equity shareholder percentage or investment holding
      const shareholder = await Shareholder.findOne({ startup: resolution.startup, user: userId, status: 'Active' });
      if (shareholder && shareholder.votingRights) {
        return shareholder.ownershipPercentage || 1;
      }
      const investment = await Investment.findOne({ startup: resolution.startup, investor: userId, investmentStatus: 'Active' });
      if (investment) {
        return investment.ownershipPercentage || 1;
      }
      return 0;
    }
  }


  /**
   * Cast a vote on a resolution
   */
  async castVote({ resolutionId, voterId, voteValue, comment = '' }) {
    const resolution = await BoardResolution.findById(resolutionId);
    if (!resolution) throw new Error('Board resolution not found');

    if (resolution.status !== 'Voting' && resolution.status !== 'Proposed') {
      throw new Error(`Voting is closed for resolution in '${resolution.status}' status`);
    }

    if (resolution.votingEndDate && new Date() > new Date(resolution.votingEndDate)) {
      throw new Error('Voting period has expired for this resolution');
    }

    // Check duplicate vote
    const existingVote = await GovernanceVote.findOne({ resolution: resolution._id, voter: voterId });
    if (existingVote) {
      throw new Error('You have already cast your vote on this resolution');
    }

    // Calculate server-side voting power
    const votingPower = await this.calculateVotingPower({ resolution, userId: voterId });
    if (votingPower <= 0) {
      throw new Error('You do not have voting rights for this resolution');
    }

    const vote = await GovernanceVote.create({
      resolution: resolution._id,
      startup: resolution.startup,
      voter: voterId,
      voterType: resolution.meeting ? 'Director' : 'Shareholder',
      vote: voteValue,
      votingPower,
      comment,
    });

    // Update resolution voting tally
    await this.recalculateResolutionResults(resolution._id);

    // Audit log
    await governanceService.recordActivity({
      startupId: resolution.startup,
      actorId: voterId,
      eventType: 'VOTE_CAST',
      entityType: 'BoardResolution',
      entityId: resolution._id,
      description: `Vote '${voteValue}' cast on resolution '${resolution.title}' (Voting power: ${votingPower})`,
    });

    return vote;
  }

  /**
   * Recalculate resolution vote totals, approval percentage, and result
   */
  async recalculateResolutionResults(resolutionId) {
    const resolution = await BoardResolution.findById(resolutionId);
    if (!resolution) return;

    const votes = await GovernanceVote.find({ resolution: resolutionId, status: 'Recorded' });

    let totalVotingPowerCast = 0;
    let votesFor = 0;
    let votesAgainst = 0;
    let votesAbstain = 0;

    votes.forEach((v) => {
      totalVotingPowerCast += v.votingPower;
      if (v.vote === 'For') votesFor += v.votingPower;
      else if (v.vote === 'Against') votesAgainst += v.votingPower;
      else if (v.vote === 'Abstain') votesAbstain += v.votingPower;
    });

    const approvalPercentage = totalVotingPowerCast > 0 ? Number(((votesFor / totalVotingPowerCast) * 100).toFixed(2)) : 0;
    resolution.approvalPercentage = approvalPercentage;

    if (approvalPercentage >= resolution.requiredApprovalPercentage) {
      resolution.result = 'Approved';
      resolution.status = 'Approved';
      resolution.effectiveDate = new Date();
    }

    await resolution.save();
    return resolution;
  }
}

module.exports = new VotingService();
