const TermSheet = require('../models/TermSheet');
const Deal = require('../models/Deal');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

/**
 * @desc    Propose a new Term Sheet version for a Deal Room
 * @route   POST /api/deals/:dealId/term-sheets
 * @access  Private (Participants)
 */
const proposeTermSheet = async (req, res, next) => {
  try {
    const { dealId } = req.params;
    const {
      investmentAmount,
      preMoneyValuation,
      liquidationPreference,
      boardSeats,
      votingRights,
      expiryDate,
      notes,
    } = req.body;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    const founderId = deal.founder?._id || deal.founder;
    const investorId = deal.investor?._id || deal.investor;

    const isFounder = founderId && founderId.toString() === req.user._id.toString();
    const isInvestor = investorId && investorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFounder && !isInvestor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to propose a Term Sheet for this Deal Room' });
    }

    // Expiry date validation
    if (new Date(expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Term Sheet expiry date must be in the future' });
    }

    // Determine current highest version
    const latestTermSheet = await TermSheet.findOne({ deal: dealId }).sort({ version: -1 }).lean();
    const nextVersion = latestTermSheet ? latestTermSheet.version + 1 : 1;

    // Mark previous active proposals as Superseded
    if (latestTermSheet && latestTermSheet.status === 'Proposed') {
      await TermSheet.findByIdAndUpdate(latestTermSheet._id, { status: 'Superseded' });
    }

    const postMoneyValuation = (Number(preMoneyValuation) || 0) + (Number(investmentAmount) || 0);

    const termSheet = await TermSheet.create({
      deal: dealId,
      startup: deal.startup?._id || deal.startup,
      investor: investorId,
      founder: founderId,
      version: nextVersion,
      proposedBy: req.user._id,
      investmentAmount,
      preMoneyValuation,
      postMoneyValuation,
      liquidationPreference: liquidationPreference || '1x Non-Participating',
      boardSeats: boardSeats || 0,
      votingRights: votingRights || 'Standard Major Investor Voting Rights',
      expiryDate,
      status: 'Proposed',
      notes: notes || '',
    });

    // Update Deal Room Status
    deal.status = 'Term Sheet Proposed';
    deal.targetInvestment = investmentAmount;
    deal.valuation = preMoneyValuation;
    await deal.save();

    // Log Activity
    await ActivityLog.create({
      activityType: 'deal',
      deal: dealId,
      startup: deal.startup?._id || deal.startup,
      actor: req.user._id,
      action: 'TERM_SHEET_PROPOSED',
      description: `Term Sheet v${nextVersion} proposed with $${investmentAmount.toLocaleString()} investment at $${preMoneyValuation.toLocaleString()} valuation`,
      metadata: { termSheetId: termSheet._id, version: nextVersion, newStatus: 'Term Sheet Proposed' },
    });

    // Notify Counterpart
    const recipientId = isInvestor ? founderId : (investorId || founderId);
    if (recipientId) {
      await Notification.create({
        user: recipientId,
        sender: req.user._id,
        type: 'DEAL_UPDATE',
        title: `Term Sheet v${nextVersion} Proposed`,
        message: `A new Term Sheet (v${nextVersion}) has been proposed for your review.`,
      });
    }

    res.status(201).json({
      success: true,
      message: `Term Sheet v${nextVersion} proposed successfully`,
      data: termSheet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Term Sheet proposals for a Deal Room
 * @route   GET /api/deals/:dealId/term-sheets
 * @access  Private (Participants + Admin)
 */
const getTermSheetsForDeal = async (req, res, next) => {
  try {
    const { dealId } = req.params;
    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    const founderId = deal.founder?._id || deal.founder;
    const investorId = deal.investor?._id || deal.investor;

    const isFounder = founderId && founderId.toString() === req.user._id.toString();
    const isInvestor = investorId && investorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFounder && !isInvestor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view Term Sheets for this Deal Room' });
    }

    const termSheets = await TermSheet.find({ deal: dealId })
      .populate('proposedBy', 'name email organization avatar')
      .sort({ version: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: termSheets.length,
      data: termSheets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a Term Sheet proposal
 * @route   PATCH /api/deals/:dealId/term-sheets/:id/accept
 * @access  Private (Counterpart Participant)
 */
const acceptTermSheet = async (req, res, next) => {
  try {
    const { dealId, id } = req.params;

    const termSheet = await TermSheet.findById(id);
    if (!termSheet) {
      return res.status(404).json({ success: false, message: 'Term Sheet proposal not found' });
    }

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    const proposedById = termSheet.proposedBy?._id || termSheet.proposedBy;
    if (proposedById && proposedById.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot accept your own Term Sheet proposal' });
    }

    termSheet.status = 'Accepted';
    termSheet.acceptedAt = new Date();
    await termSheet.save();

    // Update Deal Status
    deal.status = 'Term Sheet Accepted';
    deal.targetInvestment = termSheet.investmentAmount;
    deal.valuation = termSheet.preMoneyValuation;
    await deal.save();

    // Log Activity
    await ActivityLog.create({
      activityType: 'deal',
      deal: dealId,
      startup: deal.startup,
      actor: req.user._id,
      action: 'TERM_SHEET_ACCEPTED',
      description: `Term Sheet v${termSheet.version} formally ACCEPTED`,
      metadata: { previousStatus: 'Term Sheet Proposed', newStatus: 'Term Sheet Accepted' },
    });

    // Notify Proposer
    await Notification.create({
      user: termSheet.proposedBy,
      sender: req.user._id,
      type: 'DEAL_UPDATE',
      title: `Term Sheet v${termSheet.version} Accepted! 🎉`,
      message: `Your Term Sheet proposal (v${termSheet.version}) has been accepted.`,
    });

    res.status(200).json({
      success: true,
      message: `Term Sheet v${termSheet.version} accepted successfully`,
      data: termSheet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Decline/Reject a Term Sheet proposal
 * @route   PATCH /api/deals/:dealId/term-sheets/:id/decline
 * @access  Private (Counterpart Participant)
 */
const declineTermSheet = async (req, res, next) => {
  try {
    const { dealId, id } = req.params;
    const { rejectionReason } = req.body;

    const termSheet = await TermSheet.findById(id);
    if (!termSheet) {
      return res.status(404).json({ success: false, message: 'Term Sheet proposal not found' });
    }

    termSheet.status = 'Rejected';
    termSheet.rejectedAt = new Date();
    termSheet.rejectionReason = rejectionReason || 'Declined during negotiation';
    await termSheet.save();

    const deal = await Deal.findById(dealId);
    if (deal) {
      deal.status = 'Negotiating';
      await deal.save();
    }

    // Log Activity
    await ActivityLog.create({
      activityType: 'deal',
      deal: dealId,
      startup: deal ? deal.startup : null,
      actor: req.user._id,
      action: 'TERM_SHEET_REJECTED',
      description: `Term Sheet v${termSheet.version} declined: "${rejectionReason || 'No reason provided'}"`,
      metadata: { newStatus: 'Negotiating' },
    });

    // Notify Proposer
    await Notification.create({
      user: termSheet.proposedBy,
      sender: req.user._id,
      type: 'DEAL_UPDATE',
      title: `Term Sheet v${termSheet.version} Declined`,
      message: `Term Sheet v${termSheet.version} was declined. Reason: ${rejectionReason || 'Declined during negotiation'}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Term Sheet declined successfully',
      data: termSheet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw a Term Sheet proposal
 * @route   PATCH /api/deals/:dealId/term-sheets/:id/withdraw
 * @access  Private (Proposer)
 */
const withdrawTermSheet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const termSheet = await TermSheet.findById(id);

    if (!termSheet) {
      return res.status(404).json({ success: false, message: 'Term Sheet proposal not found' });
    }

    const proposedById = termSheet.proposedBy?._id || termSheet.proposedBy;
    if (!proposedById || proposedById.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the proposer can withdraw this Term Sheet' });
    }

    termSheet.status = 'Withdrawn';
    await termSheet.save();

    res.status(200).json({
      success: true,
      message: 'Term Sheet proposal withdrawn',
      data: termSheet,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  proposeTermSheet,
  getTermSheetsForDeal,
  acceptTermSheet,
  declineTermSheet,
  withdrawTermSheet,
};
