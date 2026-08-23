const InvestorCommitment = require('../models/InvestorCommitment');
const FundraisingRound = require('../models/FundraisingRound');
const InvestorStrategy = require('../models/InvestorStrategy');
const CapitalAllocationPlan = require('../models/CapitalAllocationPlan');
const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const fundraisingStatusService = require('../services/fundraisingStatusService');

/**
 * Submit or create an Investor Commitment for a Fundraising Round
 */
exports.createCommitment = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const {
      requestedAmount,
      committedAmount,
      investorRole,
      proposedOwnership,
      proposedValuation,
      message,
      notes,
    } = req.body;

    const round = await FundraisingRound.findById(roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Fundraising round not found' });
    }

    if (['Draft', 'Closed', 'Cancelled'].includes(round.status)) {
      return res.status(400).json({ success: false, message: `Cannot submit commitment to a round in '${round.status}' status` });
    }

    const proposedAmount = Number(committedAmount || requestedAmount || 0);

    if (proposedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Commitment amount must be greater than zero' });
    }

    // Check round ticket limits
    if (round.minimumTicketSize > 0 && proposedAmount < round.minimumTicketSize) {
      return res.status(400).json({
        success: false,
        message: `Proposed commitment ($${proposedAmount.toLocaleString()}) is below minimum ticket size ($${round.minimumTicketSize.toLocaleString()})`,
      });
    }

    if (round.maximumTicketSize > 0 && proposedAmount > round.maximumTicketSize) {
      return res.status(400).json({
        success: false,
        message: `Proposed commitment ($${proposedAmount.toLocaleString()}) exceeds maximum ticket size ($${round.maximumTicketSize.toLocaleString()})`,
      });
    }

    // Validate Investor Capital Constraints (Phase 16 Integration)
    const strategy = await InvestorStrategy.findOne({ investor: req.user._id, active: true }).lean();
    const allocationPlan = await CapitalAllocationPlan.findOne({ investor: req.user._id, status: { $ne: 'Rejected' } }).lean();

    if (allocationPlan && allocationPlan.totalAvailableCapital > 0) {
      const remainingCapital = allocationPlan.availableForNewInvestments || (allocationPlan.totalAvailableCapital - allocationPlan.alreadyDeployedCapital - allocationPlan.reservedFollowOnCapital);
      if (proposedAmount > remainingCapital) {
        return res.status(400).json({
          success: false,
          message: `Capital allocation constraint failure: Proposed commitment ($${proposedAmount.toLocaleString()}) exceeds available capital for new investments ($${remainingCapital.toLocaleString()})`,
        });
      }
    }

    // Check for duplicate active commitment
    const existingCommitment = await InvestorCommitment.findOne({
      fundraisingRound: round._id,
      investor: req.user._id,
    });

    if (existingCommitment) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active commitment record for this fundraising round. Use update endpoint to modify.',
      });
    }

    const commitmentStatus = req.body.commitmentStatus || (proposedAmount > 0 ? 'Soft Committed' : 'Interested');

    const commitment = await InvestorCommitment.create({
      fundraisingRound: round._id,
      startup: round.startup,
      founder: round.founder,
      investor: req.user._id,
      commitmentStatus,
      investorRole: investorRole || 'Participant',
      requestedAmount: proposedAmount,
      committedAmount: proposedAmount,
      fundedAmount: 0,
      proposedOwnership: proposedOwnership ? Number(proposedOwnership) : 0,
      proposedValuation: proposedValuation ? Number(proposedValuation) : 0,
      message: message || '',
      notes: notes || '',
      source: 'Platform',
      committedAt: ['Committed', 'Soft Committed'].includes(commitmentStatus) ? new Date() : null,
      createdBy: req.user._id,
    });

    // Update round progress calculations
    await fundraisingStatusService.updateRoundProgress(round._id, req.user._id);

    // Audit activity
    await fundraisingStatusService.recordActivity({
      fundraisingRound: round._id,
      startup: round.startup,
      investor: req.user._id,
      founder: round.founder,
      actor: req.user._id,
      action: 'COMMITMENT_SUBMITTED',
      description: `Investor submitted commitment of $${proposedAmount.toLocaleString()} (${commitmentStatus})`,
      metadata: { commitmentId: commitment._id, amount: proposedAmount, status: commitmentStatus },
    });

    // Notify founder
    await Notification.create({
      user: round.founder,
      type: 'CommitmentUpdate',
      title: 'New Investor Commitment Received',
      message: `An investor submitted a ${commitmentStatus} commitment of $${proposedAmount.toLocaleString()} for ${round.roundName}.`,
      relatedEntityType: 'InvestorCommitment',
      relatedEntityId: commitment._id,
    });

    res.status(201).json({
      success: true,
      data: commitment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate commitment for this round already exists' });
    }
    next(error);
  }
};

/**
 * List commitments for a round
 */
exports.getCommitmentsForRound = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const round = await FundraisingRound.findById(roundId).lean();

    if (!round) {
      return res.status(404).json({ success: false, message: 'Fundraising round not found' });
    }

    let query = { fundraisingRound: roundId };

    if (req.user.role === 'investor') {
      // Investors only see their own commitment unless admin or participant
      query.investor = req.user._id;
    } else if (req.user.role === 'founder' && round.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to round commitments' });
    }

    const commitments = await InvestorCommitment.find(query)
      .populate('investor', 'name email avatar organization investorType checkSizeMin checkSizeMax')
      .populate('fundraisingRound', 'roundName roundType targetAmount status')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: commitments.length,
      data: commitments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get individual commitment details
 */
exports.getCommitmentById = async (req, res, next) => {
  try {
    const commitment = await InvestorCommitment.findById(req.params.id)
      .populate('investor', 'name email avatar organization')
      .populate('startup', 'startupName logo tagline sector')
      .populate('fundraisingRound', 'roundName targetAmount status')
      .lean();

    if (!commitment) {
      return res.status(404).json({ success: false, message: 'Commitment not found' });
    }

    // Access authorization check
    if (req.user.role === 'investor' && commitment.investor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this commitment record' });
    }
    if (req.user.role === 'founder' && commitment.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this commitment record' });
    }

    res.status(200).json({
      success: true,
      data: commitment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update commitment fields
 */
exports.updateCommitment = async (req, res, next) => {
  try {
    const commitment = await InvestorCommitment.findById(req.params.id);
    if (!commitment) {
      return res.status(404).json({ success: false, message: 'Commitment not found' });
    }

    // Check ownership
    if (req.user.role === 'investor' && commitment.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this commitment' });
    }

    const { committedAmount, requestedAmount, investorRole, proposedOwnership, proposedValuation, message, notes } = req.body;
    const newAmount = Number(committedAmount || requestedAmount || commitment.committedAmount);

    if (newAmount > 0 && req.user.role === 'investor') {
      // Validate capital constraints
      const allocationPlan = await CapitalAllocationPlan.findOne({ investor: req.user._id, status: { $ne: 'Rejected' } }).lean();
      if (allocationPlan && allocationPlan.totalAvailableCapital > 0) {
        const remainingCapital = allocationPlan.availableForNewInvestments || (allocationPlan.totalAvailableCapital - allocationPlan.alreadyDeployedCapital);
        if (newAmount > remainingCapital) {
          return res.status(400).json({
            success: false,
            message: `Updated commitment ($${newAmount.toLocaleString()}) exceeds available allocation capital ($${remainingCapital.toLocaleString()})`,
          });
        }
      }
    }

    if (committedAmount !== undefined) commitment.committedAmount = Number(committedAmount);
    if (requestedAmount !== undefined) commitment.requestedAmount = Number(requestedAmount);
    if (investorRole) commitment.investorRole = investorRole;
    if (proposedOwnership !== undefined) commitment.proposedOwnership = Number(proposedOwnership);
    if (proposedValuation !== undefined) commitment.proposedValuation = Number(proposedValuation);
    if (message !== undefined) commitment.message = message;
    if (notes !== undefined && req.user.role === 'investor') commitment.notes = notes;

    commitment.updatedBy = req.user._id;
    await commitment.save();

    await fundraisingStatusService.updateRoundProgress(commitment.fundraisingRound, req.user._id);

    res.status(200).json({
      success: true,
      data: commitment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept commitment (Founder endpoint)
 */
exports.acceptCommitment = async (req, res, next) => {
  try {
    const commitment = await InvestorCommitment.findById(req.params.id);
    if (!commitment) {
      return res.status(404).json({ success: false, message: 'Commitment not found' });
    }

    if (req.user.role !== 'admin' && commitment.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the founder or admin can accept commitments' });
    }

    commitment.commitmentStatus = 'Committed';
    commitment.committedAt = new Date();
    commitment.updatedBy = req.user._id;
    await commitment.save();

    await fundraisingStatusService.updateRoundProgress(commitment.fundraisingRound, req.user._id);

    await fundraisingStatusService.recordActivity({
      fundraisingRound: commitment.fundraisingRound,
      startup: commitment.startup,
      investor: commitment.investor,
      founder: commitment.founder,
      actor: req.user._id,
      action: 'COMMITMENT_ACCEPTED',
      description: `Founder accepted investor commitment of $${commitment.committedAmount.toLocaleString()}`,
    });

    await Notification.create({
      user: commitment.investor,
      type: 'CommitmentUpdate',
      title: 'Commitment Accepted!',
      message: `Your commitment of $${commitment.committedAmount.toLocaleString()} has been accepted by the founder.`,
      relatedEntityType: 'InvestorCommitment',
      relatedEntityId: commitment._id,
    });

    res.status(200).json({ success: true, data: commitment });
  } catch (error) {
    next(error);
  }
};

/**
 * Decline commitment
 */
exports.declineCommitment = async (req, res, next) => {
  try {
    const commitment = await InvestorCommitment.findById(req.params.id);
    if (!commitment) {
      return res.status(404).json({ success: false, message: 'Commitment not found' });
    }

    if (
      req.user.role !== 'admin' &&
      commitment.founder.toString() !== req.user._id.toString() &&
      commitment.investor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to decline this commitment' });
    }

    commitment.commitmentStatus = 'Declined';
    commitment.declineReason = req.body.reason || 'Declined by authorized party';
    commitment.updatedBy = req.user._id;
    await commitment.save();

    await fundraisingStatusService.updateRoundProgress(commitment.fundraisingRound, req.user._id);

    res.status(200).json({ success: true, data: commitment });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw commitment (Investor endpoint)
 */
exports.withdrawCommitment = async (req, res, next) => {
  try {
    const commitment = await InvestorCommitment.findById(req.params.id);
    if (!commitment) {
      return res.status(404).json({ success: false, message: 'Commitment not found' });
    }

    if (req.user.role !== 'admin' && commitment.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the investor can withdraw their commitment' });
    }

    if (commitment.commitmentStatus === 'Funded') {
      return res.status(400).json({ success: false, message: 'Cannot withdraw a commitment that has already been funded' });
    }

    commitment.commitmentStatus = 'Withdrawn';
    commitment.withdrawnAt = new Date();
    commitment.updatedBy = req.user._id;
    await commitment.save();

    await fundraisingStatusService.updateRoundProgress(commitment.fundraisingRound, req.user._id);

    res.status(200).json({ success: true, data: commitment });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark commitment funded
 */
exports.markFunded = async (req, res, next) => {
  try {
    const commitment = await InvestorCommitment.findById(req.params.id);
    if (!commitment) {
      return res.status(404).json({ success: false, message: 'Commitment not found' });
    }

    if (
      req.user.role !== 'admin' &&
      commitment.founder.toString() !== req.user._id.toString() &&
      commitment.investor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to mark commitment as funded' });
    }

    const fundedAmount = req.body.fundedAmount ? Number(req.body.fundedAmount) : commitment.committedAmount;

    commitment.commitmentStatus = 'Funded';
    commitment.fundedAmount = fundedAmount;
    commitment.fundedAt = new Date();
    commitment.updatedBy = req.user._id;
    await commitment.save();

    await fundraisingStatusService.updateRoundProgress(commitment.fundraisingRound, req.user._id);

    await fundraisingStatusService.recordActivity({
      fundraisingRound: commitment.fundraisingRound,
      startup: commitment.startup,
      investor: commitment.investor,
      founder: commitment.founder,
      actor: req.user._id,
      action: 'COMMITMENT_FUNDED',
      description: `Commitment marked funded for $${fundedAmount.toLocaleString()}`,
    });

    res.status(200).json({ success: true, data: commitment });
  } catch (error) {
    next(error);
  }
};

/**
 * Transition commitment towards Deal Room Workflow
 */
exports.openDealRoomForCommitment = async (req, res, next) => {
  try {
    const commitment = await InvestorCommitment.findById(req.params.id);
    if (!commitment) {
      return res.status(404).json({ success: false, message: 'Commitment not found' });
    }

    let deal = await Deal.findOne({ startup: commitment.startup, investor: commitment.investor });
    if (!deal) {
      deal = await Deal.create({
        startup: commitment.startup,
        investor: commitment.investor,
        founder: commitment.founder,
        targetInvestment: commitment.committedAmount || commitment.requestedAmount,
        valuation: commitment.proposedValuation,
        status: 'Active',
        termsSummary: `Deal Room launched from Fundraising Round commitment (${commitment.investorRole})`,
      });
    }

    await fundraisingStatusService.recordActivity({
      fundraisingRound: commitment.fundraisingRound,
      startup: commitment.startup,
      investor: commitment.investor,
      founder: commitment.founder,
      actor: req.user._id,
      action: 'DEAL_ROOM_CREATED',
      description: `Opened Deal Room for accepted commitment ($${commitment.committedAmount.toLocaleString()})`,
    });

    res.status(200).json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
};
