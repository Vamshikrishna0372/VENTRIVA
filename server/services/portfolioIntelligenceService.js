const Investment = require('../models/Investment');
const PortfolioUpdate = require('../models/PortfolioUpdate');

/**
 * Deterministic Rule-Based Intelligence Alert Engine
 */
const generatePortfolioAlerts = async (investorId) => {
  const query = investorId ? { investor: investorId, isArchived: false } : { isArchived: false };

  const investments = await Investment.find(query)
    .populate('startup', 'startupName sector stage')
    .lean();

  const alerts = [];

  for (const inv of investments) {
    const startupName = inv.startup?.startupName || 'Portfolio Startup';

    // Rule 1: Health Status Critical / At Risk
    if (inv.healthStatus === 'Critical') {
      alerts.push({
        id: `alert-health-${inv._id}`,
        investmentId: inv._id,
        startupName,
        type: 'Runway Risk',
        priority: 'Critical',
        title: `CRITICAL: ${startupName} Cash Runway Alert`,
        description: `${startupName} is currently operating in Critical health status (${inv.healthScore}/100 score).`,
        recommendedAction: 'Contact founder immediately to review emergency cash preservation options.',
      });
    } else if (inv.healthStatus === 'At Risk' || inv.healthStatus === 'Watch') {
      alerts.push({
        id: `alert-watch-${inv._id}`,
        investmentId: inv._id,
        startupName,
        type: 'Valuation Change',
        priority: 'Medium',
        title: `WATCHLIST: ${startupName} Performance Monitoring`,
        description: `${startupName} has been flagged for watchlist monitoring (Score: ${inv.healthScore}/100).`,
        recommendedAction: 'Schedule monthly check-in call with founder.',
      });
    }

    // Rule 2: Follow-On Opportunity Identification
    if (inv.healthScore >= 85 && inv.returnMultiple >= 1.2) {
      alerts.push({
        id: `alert-opp-${inv._id}`,
        investmentId: inv._id,
        startupName,
        type: 'Follow-On Opportunity',
        priority: 'Low',
        title: `OPPORTUNITY: ${startupName} High Growth Trajectory`,
        description: `${startupName} exhibits excellent health (${inv.healthScore}/100) and ${inv.returnMultiple}x MOIC appreciation.`,
        recommendedAction: 'Evaluate pro-rata participation for upcoming growth round.',
      });
    }
  }

  return alerts;
};

module.exports = {
  generatePortfolioAlerts,
};
