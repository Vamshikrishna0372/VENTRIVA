const PortfolioPerformance = require('../models/PortfolioPerformance');
const Investment = require('../models/Investment');
const { calculateInvestmentPerformance } = require('../services/portfolioPerformanceService');

/**
 * @desc    Record or update periodic performance snapshot
 * @route   POST /api/portfolio-performance
 * @access  Private (Founder or Investor)
 */
const recordPerformanceSnapshot = async (req, res, next) => {
  try {
    const {
      investmentId,
      reportingPeriod,
      revenue,
      revenueGrowth,
      monthlyRecurringRevenue,
      annualRecurringRevenue,
      customerCount,
      burnRate,
      cashBalance,
      runwayMonths,
      valuation,
    } = req.body;

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    const isInvestor = investment.investor.toString() === req.user._id.toString();
    const isFounder = investment.founder.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInvestor && !isFounder && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to record performance snapshot' });
    }

    const snapshot = await PortfolioPerformance.findOneAndUpdate(
      { investment: investmentId, reportingPeriod },
      {
        investment: investmentId,
        startup: investment.startup,
        investor: investment.investor,
        reportingPeriod,
        revenue: revenue || 0,
        revenueGrowth: revenueGrowth || 0,
        monthlyRecurringRevenue: monthlyRecurringRevenue || 0,
        annualRecurringRevenue: annualRecurringRevenue || 0,
        customerCount: customerCount || 0,
        burnRate: burnRate || 0,
        cashBalance: cashBalance || 0,
        runwayMonths: runwayMonths || 12,
        valuation: valuation || investment.currentValuation || 0,
        currentValue: investment.currentValue || 0,
        ownershipPercentage: investment.ownershipPercentage || 0,
        healthScore: investment.healthScore || 80,
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Performance snapshot recorded successfully',
      data: snapshot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get performance analytics and history for an investment
 * @route   GET /api/portfolio-performance/investment/:investmentId
 * @access  Private (Participants + Admin)
 */
const getPerformanceForInvestment = async (req, res, next) => {
  try {
    const { investmentId } = req.params;
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    const isInvestor = investment.investor.toString() === req.user._id.toString();
    const isFounder = investment.founder.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInvestor && !isFounder && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view performance data' });
    }

    const perfData = await calculateInvestmentPerformance(investmentId);

    res.status(200).json({
      success: true,
      data: perfData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPerformanceSnapshot,
  getPerformanceForInvestment,
};
