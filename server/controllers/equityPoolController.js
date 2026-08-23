const EquityPool = require('../models/EquityPool');
const Startup = require('../models/Startup');
const governanceService = require('../services/governanceService');

exports.getEquityPools = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    const filter = {};

    if (startupId) filter.startup = startupId;
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) filter.startup = startup._id;
    }

    let pools = await EquityPool.find(filter).lean();

    // If unconfigured, initialize default ESOP Pool for founder
    if (pools.length === 0 && (startupId || req.user.role === 'founder')) {
      const startup = await Startup.findById(startupId || (await Startup.findOne({ founder: req.user._id }))?._id);
      if (startup) {
        const defaultPool = await EquityPool.create({
          startup: startup._id,
          poolType: 'ESOP Pool',
          name: 'Employee Option Pool 2026',
          totalShares: 1000000,
          allocatedShares: 250000,
          availableShares: 750000,
          poolPercentage: 10,
        });
        pools = [defaultPool.toObject()];
      }
    }

    res.status(200).json({ success: true, count: pools.length, data: pools });
  } catch (error) {
    next(error);
  }
};

exports.allocatePoolShares = async (req, res, next) => {
  try {
    const { sharesToAllocate, recipientName } = req.body;
    const pool = await EquityPool.findById(req.params.id);
    if (!pool) return res.status(404).json({ success: false, message: 'Equity pool not found' });

    const shares = Number(sharesToAllocate);
    if (shares <= 0 || shares > pool.availableShares) {
      return res.status(400).json({
        success: false,
        message: `Invalid allocation. Available pool shares: ${pool.availableShares.toLocaleString()}`,
      });
    }

    pool.allocatedShares += shares;
    pool.availableShares -= shares;
    await pool.save();

    await governanceService.recordActivity({
      startupId: pool.startup,
      actorId: req.user._id,
      eventType: 'EQUITY_POOL_ALLOCATED',
      entityType: 'EquityPool',
      entityId: pool._id,
      description: `Allocated ${shares.toLocaleString()} ESOP shares to ${recipientName || 'Employee'}`,
    });

    res.status(200).json({ success: true, data: pool });
  } catch (error) {
    next(error);
  }
};
