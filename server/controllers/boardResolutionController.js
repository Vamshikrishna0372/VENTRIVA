const BoardResolution = require('../models/BoardResolution');
const GovernanceVote = require('../models/GovernanceVote');
const Startup = require('../models/Startup');
const governanceService = require('../services/governanceService');

exports.getResolutions = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    const filter = {};

    if (startupId) filter.startup = startupId;
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) filter.startup = startup._id;
    }

    const resolutions = await BoardResolution.find(filter)
      .populate('proposedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const resolutionsWithVotes = await Promise.all(
      resolutions.map(async (resDoc) => {
        const votes = await GovernanceVote.find({ resolution: resDoc._id }).populate('voter', 'name email role').lean();
        const userVote = votes.find((v) => v.voter._id.toString() === req.user._id.toString());
        return { ...resDoc, votes, userVote };
      })
    );

    res.status(200).json({ success: true, count: resolutionsWithVotes.length, data: resolutionsWithVotes });
  } catch (error) {
    next(error);
  }
};

exports.proposeResolution = async (req, res, next) => {
  try {
    const { startupId, meetingId, title, description, resolutionType, votingEndDate, requiredApprovalPercentage } = req.body;
    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    const sName = startup.companyName || startup.startupName || startup.name || 'VEN';
    const resolutionNum = `RES-${sName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const resolution = await BoardResolution.create({
      startup: startup._id,
      meeting: meetingId || null,
      resolutionNumber: resolutionNum,
      title,
      description,
      resolutionType: resolutionType || 'Strategic Decision',
      proposedBy: req.user._id,
      votingEndDate: votingEndDate ? new Date(votingEndDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      requiredApprovalPercentage: requiredApprovalPercentage || 51,
      status: 'Voting',
    });

    await governanceService.recordActivity({
      startupId: startup._id,
      actorId: req.user._id,
      eventType: 'RESOLUTION_PROPOSED',
      entityType: 'BoardResolution',
      entityId: resolution._id,
      description: `Proposed Board Resolution #${resolution.resolutionNumber}: '${resolution.title}'`,
    });

    res.status(201).json({ success: true, data: resolution });
  } catch (error) {
    next(error);
  }
};
