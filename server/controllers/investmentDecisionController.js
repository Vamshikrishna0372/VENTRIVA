const InvestmentDecision = require('../models/InvestmentDecision');
const Startup = require('../models/Startup');
const Evaluation = require('../models/Evaluation');

/**
 * @desc    Record or update a private investment decision (upsert)
 * @route   POST /api/investment-decisions
 * @access  Private (Investor only)
 */
const recordDecision = async (req, res, next) => {
  try {
    const {
      startupId,
      decisionType,
      decisionStatus,
      convictionScore,
      strategicFitScore,
      riskScore,
      recommendedInvestmentAmount,
      recommendedOwnership,
      rationale,
      keyRisks,
      keyUpsideFactors,
    } = req.body;

    if (!startupId) {
      return res.status(400).json({ success: false, message: 'Startup ID is required' });
    }

    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    const score = Number(convictionScore || 80);
    if (isNaN(score) || score < 0 || score > 100) {
      return res.status(400).json({ success: false, message: 'Conviction score must be between 0 and 100' });
    }

    const amount = Number(recommendedInvestmentAmount || 250000);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Recommended investment amount must be greater than $0' });
    }

    const ownPct = Number(recommendedOwnership || 10);
    if (isNaN(ownPct) || ownPct < 0 || ownPct > 100) {
      return res.status(400).json({ success: false, message: 'Recommended ownership must be between 0% and 100%' });
    }

    const validDecisionTypes = ['Invest', 'Follow-On', 'Pass', 'Hold'];
    const type = validDecisionTypes.includes(decisionType) ? decisionType : 'Invest';

    const validStatuses = ['Draft', 'Submitted', 'Approved', 'Rejected'];
    const status = validStatuses.includes(decisionStatus) ? decisionStatus : 'Approved';

    // Find linked evaluation record if exists
    const evaluation = await Evaluation.findOne({ startup: startup._id, investor: req.user._id }).lean();

    const updateFields = {
      investor: req.user._id,
      startup: startup._id,
      evaluation: evaluation?._id || null,
      decisionType: type,
      decisionStatus: status,
      convictionScore: score,
      strategicFitScore: Number(strategicFitScore || 85),
      riskScore: Number(riskScore || 30),
      recommendedInvestmentAmount: amount,
      recommendedOwnership: ownPct,
      rationale: rationale ? rationale.trim() : '',
      keyRisks: keyRisks ? keyRisks.trim() : '',
      keyUpsideFactors: keyUpsideFactors ? keyUpsideFactors.trim() : '',
      decisionDate: new Date(),
    };

    const decision = await InvestmentDecision.findOneAndUpdate(
      { investor: req.user._id, startup: startup._id },
      updateFields,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Private investment decision recorded & saved securely',
      data: decision,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get private investment decisions for authenticated investor
 * @route   GET /api/investment-decisions
 * @access  Private (Investor only)
 */
const getMyDecisions = async (req, res, next) => {
  try {
    const decisions = await InvestmentDecision.find({ investor: req.user._id })
      .populate('startup', 'startupName sector stage logo tagline valuation ARR')
      .populate('evaluation', 'overallScore convictionScore status')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: decisions.length,
      data: decisions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing private investment decision
 * @route   PATCH /api/investment-decisions/:id
 * @access  Private (Investor only)
 */
const updateDecision = async (req, res, next) => {
  try {
    const decision = await InvestmentDecision.findById(req.params.id);
    if (!decision) {
      return res.status(404).json({ success: false, message: 'Investment decision record not found' });
    }

    if (decision.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this private decision' });
    }

    const {
      decisionType,
      decisionStatus,
      convictionScore,
      recommendedInvestmentAmount,
      recommendedOwnership,
      rationale,
      keyRisks,
      keyUpsideFactors,
    } = req.body;

    if (decisionType) decision.decisionType = decisionType;
    if (decisionStatus) decision.decisionStatus = decisionStatus;
    if (convictionScore !== undefined) {
      const score = Number(convictionScore);
      if (isNaN(score) || score < 0 || score > 100) {
        return res.status(400).json({ success: false, message: 'Conviction score must be between 0 and 100' });
      }
      decision.convictionScore = score;
    }
    if (recommendedInvestmentAmount !== undefined) {
      const amount = Number(recommendedInvestmentAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Recommended investment amount must be > $0' });
      }
      decision.recommendedInvestmentAmount = amount;
    }
    if (recommendedOwnership !== undefined) {
      const ownPct = Number(recommendedOwnership);
      if (isNaN(ownPct) || ownPct < 0 || ownPct > 100) {
        return res.status(400).json({ success: false, message: 'Recommended ownership must be between 0% and 100%' });
      }
      decision.recommendedOwnership = ownPct;
    }
    if (rationale !== undefined) decision.rationale = rationale.trim();
    if (keyRisks !== undefined) decision.keyRisks = keyRisks.trim();
    if (keyUpsideFactors !== undefined) decision.keyUpsideFactors = keyUpsideFactors.trim();

    await decision.save();

    res.status(200).json({
      success: true,
      message: 'Private decision updated successfully',
      data: decision,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a private investment decision record
 * @route   DELETE /api/investment-decisions/:id
 * @access  Private (Investor only)
 */
const deleteDecision = async (req, res, next) => {
  try {
    const decision = await InvestmentDecision.findById(req.params.id);
    if (!decision) {
      return res.status(404).json({ success: false, message: 'Investment decision record not found' });
    }

    if (decision.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this private decision' });
    }

    await decision.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Private investment decision removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordDecision,
  getMyDecisions,
  updateDecision,
  deleteDecision,
};

