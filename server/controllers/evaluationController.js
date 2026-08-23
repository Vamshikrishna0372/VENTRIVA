const mongoose = require('mongoose');
const Evaluation = require('../models/Evaluation');
const Startup = require('../models/Startup');
const {
  EVALUATION_WEIGHTS,
  INVESTMENT_DECISIONS,
  EVALUATION_STATUSES,
  calculateOverallScore,
} = require('../config/evaluationConstants');

// Helper to check startup discovery eligibility
const checkStartupEligibility = async (startupId) => {
  if (!mongoose.Types.ObjectId.isValid(startupId)) {
    return { error: 'Invalid Startup ObjectId format', status: 400 };
  }

  const startup = await Startup.findById(startupId);
  if (!startup || startup.isDeleted || !startup.isPublished || startup.profileVisibility !== 'Investors Only') {
    return { error: 'Startup profile unavailable for evaluation', status: 404 };
  }

  return { startup };
};

/**
 * @desc    Create or update investor's private evaluation for a startup
 * @route   POST /api/evaluations
 * @access  Private (Investor)
 */
const createOrUpdateEvaluation = async (req, res, next) => {
  try {
    const { startupId, scores = {}, strengths, risks, privateNotes, investmentDecision, evaluationStatus } = req.body;

    const { startup, error, status } = await checkStartupEligibility(startupId);
    if (error) return res.status(status).json({ success: false, message: error });

    // Validate Scores Range (1 to 10)
    const categoryKeys = Object.keys(EVALUATION_WEIGHTS);
    const sanitizedScores = {};

    for (const key of categoryKeys) {
      if (scores[key] !== undefined && scores[key] !== null && scores[key] !== '') {
        const val = Number(scores[key]);
        if (isNaN(val) || val < 1 || val > 10) {
          return res.status(400).json({
            success: false,
            message: `Invalid score for ${key}: Score must be a number between 1 and 10`,
          });
        }
        sanitizedScores[key] = Math.round(val);
      } else {
        sanitizedScores[key] = null;
      }
    }

    if (investmentDecision && !INVESTMENT_DECISIONS.includes(investmentDecision)) {
      return res.status(400).json({ success: false, message: `Invalid investment decision: ${investmentDecision}` });
    }

    // Compute Overall Score
    const overallScore = calculateOverallScore(sanitizedScores);

    // Auto-determine evaluation completion status
    const allCategoriesScored = categoryKeys.every((key) => sanitizedScores[key] !== null);
    const finalStatus =
      evaluationStatus || (allCategoriesScored && investmentDecision && investmentDecision !== 'Undecided' ? 'Completed' : 'Draft');

    const updateFields = {
      scores: sanitizedScores,
      overallScore,
      strengths: Array.isArray(strengths) ? strengths.filter((s) => typeof s === 'string' && s.trim().length > 0) : [],
      risks: Array.isArray(risks) ? risks.filter((r) => typeof r === 'string' && r.trim().length > 0) : [],
      privateNotes: privateNotes ? privateNotes.trim() : '',
      investmentDecision: investmentDecision || 'Undecided',
      evaluationStatus: finalStatus,
    };

    const evaluation = await Evaluation.findOneAndUpdate(
      { investor: req.user._id, startup: startup._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    ).populate({
      path: 'startup',
      select: 'startupName tagline logo sector stage businessModel fundingRequired locationDisplay',
    });

    res.status(200).json({
      success: true,
      message: 'Private venture evaluation saved successfully',
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all evaluations for authenticated investor
 * @route   GET /api/evaluations/my
 * @access  Private (Investor)
 */
const getMyEvaluations = async (req, res, next) => {
  try {
    const { status, decision, sector, stage, search } = req.query;

    const query = { investor: req.user._id };
    if (status && status !== 'all') query.evaluationStatus = status;
    if (decision && decision !== 'all') query.investmentDecision = decision;

    let evaluations = await Evaluation.find(query)
      .populate({
        path: 'startup',
        select: 'startupName tagline logo sector subSector stage businessModel fundingRequired locationDisplay isDeleted isPublished profileVisibility',
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Filter out null / non-discoverable startups
    evaluations = evaluations.filter(
      (item) => item.startup && !item.startup.isDeleted && item.startup.isPublished && item.startup.profileVisibility === 'Investors Only'
    );

    // Filter by sector, stage, or search term on populated startup
    if (sector && sector !== 'all') {
      evaluations = evaluations.filter((item) => item.startup.sector === sector);
    }
    if (stage && stage !== 'all') {
      evaluations = evaluations.filter((item) => item.startup.stage === stage);
    }
    if (search && search.trim().length > 0) {
      const term = search.trim().toLowerCase();
      evaluations = evaluations.filter(
        (item) =>
          item.startup.startupName?.toLowerCase().includes(term) ||
          item.startup.tagline?.toLowerCase().includes(term) ||
          item.startup.sector?.toLowerCase().includes(term)
      );
    }

    res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get evaluation for a specific startup by authenticated investor
 * @route   GET /api/evaluations/:startupId
 * @access  Private (Investor)
 */
const getEvaluationByStartup = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    const { startup, error, status } = await checkStartupEligibility(startupId);
    if (error) return res.status(status).json({ success: false, message: error });

    const evaluation = await Evaluation.findOne({ investor: req.user._id, startup: startup._id }).lean();

    res.status(200).json({
      success: true,
      evaluation: evaluation || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete evaluation by startup ID for authenticated investor
 * @route   DELETE /api/evaluations/:startupId
 * @access  Private (Investor)
 */
const deleteEvaluation = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    await Evaluation.deleteOne({ investor: req.user._id, startup: startupId });

    res.status(200).json({
      success: true,
      message: 'Evaluation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate analytics metrics for investor's evaluations
 * @route   GET /api/evaluations/analytics/summary
 * @access  Private (Investor)
 */
const getEvaluationAnalytics = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({ investor: req.user._id }).lean();

    const totalCount = evaluations.length;
    const draftCount = evaluations.filter((e) => e.evaluationStatus === 'Draft').length;
    const completedCount = evaluations.filter((e) => e.evaluationStatus === 'Completed').length;
    const highPotentialCount = evaluations.filter((e) => e.investmentDecision === 'High Potential').length;
    const interestedCount = evaluations.filter((e) => e.investmentDecision === 'Interested').length;

    const scoresSum = evaluations.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
    const averageOverallScore = totalCount > 0 ? Math.round((scoresSum / totalCount) * 10) / 10 : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalCount,
        draftCount,
        completedCount,
        highPotentialCount,
        interestedCount,
        averageOverallScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateEvaluation,
  getMyEvaluations,
  getEvaluationByStartup,
  deleteEvaluation,
  getEvaluationAnalytics,
};
