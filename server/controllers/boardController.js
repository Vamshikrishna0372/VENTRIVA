const BoardMember = require('../models/BoardMember');
const Startup = require('../models/Startup');
const governanceService = require('../services/governanceService');

exports.getBoardMembers = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    let targetStartup = startupId;

    if (!targetStartup && req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) targetStartup = startup._id;
    }

    if (!targetStartup) {
      const members = await BoardMember.find({ user: req.user._id })
        .populate('startup', 'companyName logo sector')
        .populate('user', 'name email profileImage')
        .lean();
      return res.status(200).json({ success: true, count: members.length, data: members });
    }

    const composition = await governanceService.getBoardComposition(targetStartup);
    res.status(200).json({ success: true, data: composition });
  } catch (error) {
    next(error);
  }
};

exports.addBoardMember = async (req, res, next) => {
  try {
    const { startupId, userId, role, appointmentReason, termEndDate } = req.body;
    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only founders or admins can appoint board members' });
    }

    const member = await BoardMember.create({
      startup: startup._id,
      user: userId,
      role: role || 'Investor Director',
      appointmentReason: appointmentReason || 'Investor Board Seat Agreement',
      termEndDate: termEndDate ? new Date(termEndDate) : null,
      status: 'Active',
      votingPower: role === 'Observer' ? 0 : 1,
    });

    await governanceService.recordActivity({
      startupId: startup._id,
      actorId: req.user._id,
      eventType: 'BOARD_APPOINTED',
      entityType: 'BoardMember',
      entityId: member._id,
      description: `Appointed board member (Role: ${member.role})`,
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

exports.removeBoardMember = async (req, res, next) => {
  try {
    const member = await BoardMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Board member not found' });

    const startup = await Startup.findById(member.startup);
    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    member.status = 'Retired';
    member.termEndDate = new Date();
    await member.save();

    await governanceService.recordActivity({
      startupId: startup._id,
      actorId: req.user._id,
      eventType: 'BOARD_REMOVED',
      entityType: 'BoardMember',
      entityId: member._id,
      description: `Retired board director (Role: ${member.role})`,
    });

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};
