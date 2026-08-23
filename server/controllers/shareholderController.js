const Shareholder = require('../models/Shareholder');
const Startup = require('../models/Startup');
const capTableGovernanceService = require('../services/capTableGovernanceService');

exports.getShareholders = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    const filter = {};

    if (startupId) filter.startup = startupId;
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) filter.startup = startup._id;
    }

    const shareholders = await Shareholder.find(filter)
      .populate('user', 'name email profileImage companyName')
      .sort({ ownershipPercentage: -1 })
      .lean();

    res.status(200).json({ success: true, count: shareholders.length, data: shareholders });
  } catch (error) {
    next(error);
  }
};

exports.addShareholder = async (req, res, next) => {
  try {
    const { startupId, holderName, holderType, shareClass, sharesOwned, user } = req.body;
    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    if (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to add shareholder' });
    }

    const shares = Number(sharesOwned);
    if (shares < 0) return res.status(400).json({ success: false, message: 'Shares cannot be negative' });

    const shareholder = await Shareholder.create({
      startup: startup._id,
      user: user || null,
      holderName,
      holderType: holderType || 'Investor',
      shareClass: shareClass || 'Common Stock',
      sharesOwned: shares,
      ownershipPercentage: 0,
    });

    await capTableGovernanceService.rebalanceCapTable(startup._id);

    res.status(201).json({ success: true, data: shareholder });
  } catch (error) {
    next(error);
  }
};
