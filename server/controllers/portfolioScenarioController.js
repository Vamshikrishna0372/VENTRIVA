const PortfolioScenario = require('../models/PortfolioScenario');
const { runPortfolioSimulation } = require('../services/portfolioScenarioService');

/**
 * @desc    Run non-mutating portfolio scenario simulation
 * @route   POST /api/portfolio-scenarios/calculate
 * @access  Private (Investor only)
 */
const calculateScenario = async (req, res, next) => {
  try {
    const { name, scenarioType, valuationChangePercentage, newCapitalDeployment } = req.body;

    const results = await runPortfolioSimulation(req.user._id, {
      valuationChangePercentage,
      newCapitalDeployment,
    });

    const scenario = await PortfolioScenario.create({
      investor: req.user._id,
      name: name || 'Valuation Upside Simulation',
      scenarioType: scenarioType || 'Base Case',
      assumptions: {
        valuationChangePercentage: valuationChangePercentage || 0,
        newCapitalDeployment: newCapitalDeployment || 0,
      },
      projectedCapital: results.projectedInvested,
      projectedPortfolioValue: results.projectedPortfolioValue,
      projectedMOIC: results.projectedMOIC,
      results,
    });

    res.status(201).json({
      success: true,
      message: 'Scenario simulation calculated successfully (NON-MUTATING)',
      data: scenario,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get saved scenarios
 * @route   GET /api/portfolio-scenarios
 * @access  Private (Investor only)
 */
const getSavedScenarios = async (req, res, next) => {
  try {
    const scenarios = await PortfolioScenario.find({ investor: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: scenarios.length,
      data: scenarios,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a saved simulation scenario
 * @route   DELETE /api/portfolio-scenarios/:id
 * @access  Private (Investor only)
 */
const deleteScenario = async (req, res, next) => {
  try {
    const scenario = await PortfolioScenario.findById(req.params.id);

    if (!scenario) {
      return res.status(404).json({ success: false, message: 'Scenario not found' });
    }

    if (scenario.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this scenario' });
    }

    await scenario.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Simulation scenario deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateScenario,
  getSavedScenarios,
  deleteScenario,
};
