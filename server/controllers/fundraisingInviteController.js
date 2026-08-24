const mongoose = require('mongoose');
const FundraisingInvite = require('../models/FundraisingInvite');
const FundraisingRound = require('../models/FundraisingRound');
const InvestorCommitment = require('../models/InvestorCommitment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fundraisingStatusService = require('../services/fundraisingStatusService');

/**
 * Invite an investor to a fundraising round (Founder endpoint)
 */
exports.createInvite = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const { investorId, message, expiresAt } = req.body;

    if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({ success: false, message: 'Invalid fundraising round ID' });
    }

    if (!investorId || !mongoose.Types.ObjectId.isValid(investorId)) {
      return res.status(400).json({ success: false, message: 'Please select a valid investor to invite' });
    }

    const round = await FundraisingRound.findById(roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Fundraising round not found' });
    }

    if (req.user.role !== 'admin' && round.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the founder can issue invitations for this round' });
    }

    const investor = await User.findById(investorId);
    if (!investor || investor.role !== 'investor' || investor.isActive === false) {
      return res.status(404).json({ success: false, message: 'Investor not found or user is not an active investor' });
    }

    // Check for existing invite
    let invite = await FundraisingInvite.findOne({
      fundraisingRound: round._id,
      investor: investor._id,
    });

    let isResend = false;

    if (invite) {
      if (invite.status === 'Pending') {
        return res.status(409).json({
          success: false,
          message: 'A pending invitation already exists for this investor.',
        });
      }

      if (invite.status === 'Accepted') {
        return res.status(409).json({
          success: false,
          message: 'This investor has already accepted the invitation to this round.',
        });
      }

      if (invite.status === 'Declined' || invite.status === 'Expired' || invite.status === 'Withdrawn') {
        isResend = true;
        invite.status = 'Pending';
        invite.invitedBy = req.user._id;
        invite.message = message ? message.trim() : '';
        invite.expiresAt = expiresAt ? new Date(expiresAt) : null;
        invite.respondedAt = null;
        await invite.save();
      } else {
        return res.status(400).json({
          success: false,
          message: `Unable to re-invite investor with current status '${invite.status}'`,
        });
      }
    } else {
      invite = await FundraisingInvite.create({
        fundraisingRound: round._id,
        startup: round.startup,
        investor: investor._id,
        invitedBy: req.user._id,
        status: 'Pending',
        message: message ? message.trim() : '',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });
    }

    // Create or update commitment record in 'Invited' state
    await InvestorCommitment.findOneAndUpdate(
      { fundraisingRound: round._id, investor: investor._id },
      {
        fundraisingRound: round._id,
        startup: round.startup,
        founder: round.founder,
        investor: investor._id,
        commitmentStatus: 'Invited',
        source: 'Founder Invitation',
        createdBy: req.user._id,
      },
      { upsert: true, new: true }
    );

    // Audit log
    await fundraisingStatusService.recordActivity({
      fundraisingRound: round._id,
      startup: round.startup,
      investor: investor._id,
      founder: round.founder,
      actor: req.user._id,
      action: isResend ? 'INVESTOR_REINVITED' : 'INVESTOR_INVITED',
      description: isResend
        ? `Resent invitation to investor '${investor.name}' for fundraising round '${round.roundName}'`
        : `Invited investor '${investor.name}' to fundraising round '${round.roundName}'`,
    });

    // Send new notification for the investor
    await Notification.create({
      user: investor._id,
      type: 'FundraisingInvite',
      title: isResend ? 'Fundraising Invitation Resent' : 'New Fundraising Invitation',
      message: isResend
        ? `The founder has sent a new invitation to review and participate in ${round.roundName}.`
        : `You have been invited to review and participate in ${round.roundName}.`,
      relatedEntityType: 'FundraisingInvite',
      relatedEntityId: invite._id,
    });

    const statusCode = isResend ? 200 : 201;
    const responseMsg = isResend ? 'Invitation sent again successfully.' : 'Investor invitation sent successfully.';

    return res.status(statusCode).json({
      success: true,
      isResend,
      message: responseMsg,
      data: invite,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An invitation already exists for this investor and round.' });
    }
    next(error);
  }
};

/**
 * List invites for a round
 */
exports.getInvitesForRound = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const round = await FundraisingRound.findById(roundId).lean();

    if (!round) {
      return res.status(404).json({ success: false, message: 'Fundraising round not found' });
    }

    if (req.user.role === 'founder' && round.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = { fundraisingRound: roundId };
    if (req.user.role === 'investor') {
      query.investor = req.user._id;
    }

    const invites = await FundraisingInvite.find(query)
      .populate('investor', 'name email avatar organization')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: invites.length,
      data: invites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List invites for current investor
 */
exports.getMyInvites = async (req, res, next) => {
  try {
    const invites = await FundraisingInvite.find({ investor: req.user._id })
      .populate('startup', 'startupName logo tagline sector valuation')
      .populate('fundraisingRound', 'roundName roundType targetAmount preMoneyValuation status targetClosingDate')
      .populate('invitedBy', 'name email organization')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: invites.length,
      data: invites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept invite (Investor endpoint)
 */
exports.acceptInvite = async (req, res, next) => {
  try {
    const invite = await FundraisingInvite.findById(req.params.id);
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (req.user.role !== 'admin' && invite.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the invited investor can accept this invite' });
    }

    invite.status = 'Accepted';
    invite.respondedAt = new Date();
    await invite.save();

    // Update commitment status to 'Interested'
    await InvestorCommitment.findOneAndUpdate(
      { fundraisingRound: invite.fundraisingRound, investor: invite.investor },
      { commitmentStatus: 'Interested' }
    );

    res.status(200).json({ success: true, data: invite });
  } catch (error) {
    next(error);
  }
};

/**
 * Decline invite (Investor endpoint)
 */
exports.declineInvite = async (req, res, next) => {
  try {
    const invite = await FundraisingInvite.findById(req.params.id);
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (req.user.role !== 'admin' && invite.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the invited investor can decline this invite' });
    }

    invite.status = 'Declined';
    invite.respondedAt = new Date();
    await invite.save();

    await InvestorCommitment.findOneAndUpdate(
      { fundraisingRound: invite.fundraisingRound, investor: invite.investor },
      { commitmentStatus: 'Declined' }
    );

    res.status(200).json({ success: true, data: invite });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw invite (Founder endpoint)
 */
exports.withdrawInvite = async (req, res, next) => {
  try {
    const invite = await FundraisingInvite.findById(req.params.id);
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (req.user.role !== 'admin' && invite.invitedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the inviter can withdraw this invitation' });
    }

    invite.status = 'Withdrawn';
    await invite.save();

    res.status(200).json({ success: true, data: invite });
  } catch (error) {
    next(error);
  }
};
