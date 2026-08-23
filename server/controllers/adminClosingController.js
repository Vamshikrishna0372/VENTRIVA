const ClosingTransaction = require('../models/ClosingTransaction');
const ActivityLog = require('../models/ActivityLog');

exports.getAdminTransactions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let filter = {};
    if (status) filter.transactionStatus = status;

    const total = await ClosingTransaction.countDocuments(filter);
    const transactions = await ClosingTransaction.find(filter)
      .populate('startup', 'startupName logo sector')
      .populate('founder', 'name email')
      .populate('investor', 'name email organization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminClosingAnalytics = async (req, res, next) => {
  try {
    const totalTransactions = await ClosingTransaction.countDocuments();
    const activeTransactions = await ClosingTransaction.countDocuments({
      transactionStatus: { $in: ['Pending', 'Due Diligence', 'Conditions Pending', 'Documentation Pending', 'Signature Pending', 'Payment Pending', 'Ready to Close'] },
    });
    const closedTransactions = await ClosingTransaction.countDocuments({ transactionStatus: 'Closed' });
    const cancelledTransactions = await ClosingTransaction.countDocuments({ transactionStatus: { $in: ['Cancelled', 'Failed'] } });

    const totalCapitalClosedResult = await ClosingTransaction.aggregate([
      { $match: { transactionStatus: 'Closed' } },
      { $group: { _id: null, total: { $sum: '$finalInvestmentAmount' }, avgAmount: { $avg: '$finalInvestmentAmount' } } },
    ]);

    const stats = totalCapitalClosedResult[0] || { total: 0, avgAmount: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        activeTransactions,
        closedTransactions,
        cancelledTransactions,
        totalCapitalClosed: stats.total,
        averageClosingSize: Math.round(stats.avgAmount),
      },
    });
  } catch (error) {
    next(error);
  }
};
