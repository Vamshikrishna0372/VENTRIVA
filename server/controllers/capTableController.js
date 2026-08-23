const capTableEngineService = require('../services/capTableEngineService');
const CapTableSnapshot = require('../models/CapTableSnapshot');
const Startup = require('../models/Startup');

exports.getCapTable = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    // Authorization check
    const founderId = (startup.founder && startup.founder._id) ? startup.founder._id.toString() : (startup.founder ? startup.founder.toString() : '');
    if (
      req.user.role !== 'admin' &&
      founderId !== req.user._id.toString()
    ) {
      // Investors can only view if they hold shares in this startup
      const capTable = await capTableEngineService.getCapTable(startupId);
      const isHolder = capTable.holdings.some((h) => h.holder?.toString() === req.user._id.toString());
      if (!isHolder) {
        return res.status(403).json({ success: false, message: 'Access denied to venture cap table' });
      }
    }

    const capTable = await capTableEngineService.getCapTable(startupId);
    res.status(200).json({ success: true, data: capTable });
  } catch (error) {
    next(error);
  }
};

exports.getCapTableHistory = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const snapshots = await CapTableSnapshot.find({ startup: startupId })
      .populate('transaction', 'transactionType finalInvestmentAmount actualClosingDate')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: snapshots.length, data: snapshots });
  } catch (error) {
    next(error);
  }
};
