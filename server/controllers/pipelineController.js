const mongoose = require('mongoose');
const PipelineEntry = require('../models/PipelineEntry');
const ActivityLog = require('../models/ActivityLog');
const Startup = require('../models/Startup');
const Evaluation = require('../models/Evaluation');
const { PIPELINE_STAGES, PIPELINE_PRIORITIES, PIPELINE_STATUSES } = require('../config/pipelineConstants');

// Helper to check startup discovery eligibility
const checkStartupEligibility = async (startupId) => {
  if (!mongoose.Types.ObjectId.isValid(startupId)) {
    return { error: 'Invalid Startup ObjectId format', status: 400 };
  }

  const startup = await Startup.findById(startupId);
  if (!startup || startup.isDeleted) {
    return { error: 'Startup profile unavailable for pipeline tracking', status: 404 };
  }

  return { startup };
};

/**
 * @desc    Create or update deal pipeline entry for current investor
 * @route   POST /api/pipelines
 * @access  Private (Investor)
 */
const createOrUpdatePipeline = async (req, res, next) => {
  try {
    const {
      startupId,
      stage,
      priority,
      status,
      notes,
      nextFollowUpDate,
      lastContactDate,
      expectedInvestment,
      investmentCurrency,
      internalRating,
      tags,
    } = req.body;

    const { startup, error, status: errStatus } = await checkStartupEligibility(startupId);
    if (error) return res.status(errStatus).json({ success: false, message: error });

    if (stage && !PIPELINE_STAGES.includes(stage)) {
      return res.status(400).json({ success: false, message: `Invalid stage: ${stage}` });
    }
    if (priority && !PIPELINE_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: `Invalid priority: ${priority}` });
    }
    if (status && !PIPELINE_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    if (expectedInvestment !== undefined && Number(expectedInvestment) < 0) {
      return res.status(400).json({ success: false, message: 'Expected investment cannot be negative' });
    }

    if (internalRating !== undefined && internalRating !== null && (Number(internalRating) < 1 || Number(internalRating) > 10)) {
      return res.status(400).json({ success: false, message: 'Internal rating must be between 1 and 10' });
    }

    let existingEntry = await PipelineEntry.findOne({ investor: req.user._id, startup: startup._id });
    const targetStage = stage || (existingEntry ? existingEntry.stage : 'New');

    // Audit stage transition history if stage is changing
    if (existingEntry && existingEntry.stage !== targetStage) {
      await ActivityLog.create({
        activityType: 'pipeline',
        pipelineEntry: existingEntry._id,
        startup: startup._id,
        actor: req.user._id,
        action: 'STAGE_CHANGED',
        description: notes || `Moved deal from ${existingEntry.stage} to ${targetStage}`,
        metadata: { previousStage: existingEntry.stage, newStage: targetStage },
      });
    }

    const updateFields = {
      stage: targetStage,
      priority: priority || (existingEntry ? existingEntry.priority : 'Medium'),
      status: status || (existingEntry ? existingEntry.status : 'Active'),
      notes: notes !== undefined ? notes.trim() : (existingEntry ? existingEntry.notes : ''),
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : (existingEntry ? existingEntry.nextFollowUpDate : null),
      lastContactDate: lastContactDate ? new Date(lastContactDate) : (existingEntry ? existingEntry.lastContactDate : null),
      expectedInvestment: expectedInvestment !== undefined ? Number(expectedInvestment) : (existingEntry ? existingEntry.expectedInvestment : 0),
      investmentCurrency: investmentCurrency || (existingEntry ? existingEntry.investmentCurrency : 'USD'),
      internalRating: internalRating !== undefined ? (internalRating ? Number(internalRating) : null) : (existingEntry ? existingEntry.internalRating : null),
      tags: Array.isArray(tags) ? tags : (existingEntry ? existingEntry.tags : []),
    };

    const pipeline = await PipelineEntry.findOneAndUpdate(
      { investor: req.user._id, startup: startup._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    ).populate({
      path: 'startup',
      select: 'startupName tagline logo sector stage businessModel fundingRequired locationDisplay',
    });

    // If new pipeline entry created, record initial stage history
    if (!existingEntry) {
      await ActivityLog.create({
        activityType: 'pipeline',
        pipelineEntry: pipeline._id,
        startup: startup._id,
        actor: req.user._id,
        action: 'PIPELINE_CREATED',
        description: 'Initial pipeline entry created',
        metadata: { newStage: pipeline.stage },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal pipeline updated successfully',
      pipeline,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pipeline entries for current investor
 * @route   GET /api/pipelines
 * @access  Private (Investor)
 */
const getMyPipelines = async (req, res, next) => {
  try {
    const { stage, priority, status, followUp, search } = req.query;

    const query = { investor: req.user._id };
    if (stage && stage !== 'all') query.stage = stage;
    if (priority && priority !== 'all') query.priority = priority;
    if (status && status !== 'all') query.status = status;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (followUp === 'dueToday') {
      query.nextFollowUpDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (followUp === 'overdue') {
      query.nextFollowUpDate = { $lt: startOfDay };
    }

    let pipelines = await PipelineEntry.find(query)
      .populate({
        path: 'startup',
        select: 'startupName tagline logo sector subSector stage businessModel fundingRequired locationDisplay isDeleted isPublished profileVisibility',
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Filter out null or non-discoverable startups
    pipelines = pipelines.filter(
      (item) => item.startup && !item.startup.isDeleted && item.startup.isPublished && item.startup.profileVisibility === 'Investors Only'
    );

    // Attach private evaluation overall score if available
    const evaluations = await Evaluation.find({ investor: req.user._id }).lean();
    const evalMap = {};
    evaluations.forEach((ev) => {
      evalMap[ev.startup.toString()] = ev.overallScore;
    });

    pipelines = pipelines.map((item) => ({
      ...item,
      evaluationScore: evalMap[item.startup._id.toString()] || null,
    }));

    if (search && search.trim().length > 0) {
      const term = search.trim().toLowerCase();
      pipelines = pipelines.filter(
        (item) =>
          item.startup.startupName?.toLowerCase().includes(term) ||
          item.startup.tagline?.toLowerCase().includes(term) ||
          item.startup.sector?.toLowerCase().includes(term)
      );
    }

    res.status(200).json({
      success: true,
      count: pipelines.length,
      pipelines,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pipeline entry & transition history by startup ID
 * @route   GET /api/pipelines/:startupId
 * @access  Private (Investor)
 */
const getPipelineByStartup = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    const { startup, error, status } = await checkStartupEligibility(startupId);
    if (error) return res.status(status).json({ success: false, message: error });

    const pipeline = await PipelineEntry.findOne({ investor: req.user._id, startup: startup._id }).lean();
    if (!pipeline) {
      return res.status(200).json({ success: true, pipeline: null, history: [] });
    }

    const history = await ActivityLog.find({ activityType: 'pipeline', pipelineEntry: pipeline._id }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      pipeline,
      history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update deal pipeline stage
 * @route   PATCH /api/pipelines/:startupId/stage
 * @access  Private (Investor)
 */
const updatePipelineStage = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const { stage, note } = req.body;

    if (!stage || !PIPELINE_STAGES.includes(stage)) {
      return res.status(400).json({ success: false, message: `Invalid stage: ${stage}` });
    }

    const { startup, error, status } = await checkStartupEligibility(startupId);
    if (error) return res.status(status).json({ success: false, message: error });

    const pipeline = await PipelineEntry.findOne({ investor: req.user._id, startup: startup._id });
    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Pipeline entry not found for this startup' });
    }

    if (pipeline.stage !== stage) {
      const prev = pipeline.stage;
      pipeline.stage = stage;
      await pipeline.save();

      await ActivityLog.create({
        activityType: 'pipeline',
        pipelineEntry: pipeline._id,
        startup: startup._id,
        actor: req.user._id,
        action: 'STAGE_CHANGED',
        description: note ? note.trim() : `Moved deal from ${prev} to ${stage}`,
        metadata: { previousStage: prev, newStage: stage },
      });

      if (['Due Diligence', 'Term Sheet', 'Closing', 'Partner Meeting', 'IC Review', 'Formal Deal'].includes(stage)) {
        const Deal = require('../models/Deal');
        let existingDeal = await Deal.findOne({ startup: startup._id, investor: req.user._id });
        if (!existingDeal && startup.founder) {
          await Deal.create({
            startup: startup._id,
            investor: req.user._id,
            founder: startup.founder,
            pipelineEntry: pipeline._id,
            targetInvestment: pipeline.expectedInvestment || startup.fundingAsk || 500000,
            valuation: startup.valuation || 2500000,
            dealType: 'Priced Equity Round',
            status: 'Active',
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Deal stage updated to ${stage}`,
      pipeline,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete pipeline entry
 * @route   DELETE /api/pipelines/:startupId
 * @access  Private (Investor)
 */
const deletePipeline = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const pipeline = await PipelineEntry.findOne({ investor: req.user._id, startup: startupId });
    if (pipeline) {
      await ActivityLog.deleteMany({ activityType: 'pipeline', pipelineEntry: pipeline._id });
      await PipelineEntry.deleteOne({ _id: pipeline._id });
    }

    res.status(200).json({
      success: true,
      message: 'Pipeline deal removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate analytics metrics for investor's pipeline
 * @route   GET /api/pipelines/analytics/summary
 * @access  Private (Investor)
 */
const getPipelineAnalytics = async (req, res, next) => {
  try {
    const pipelines = await PipelineEntry.find({ investor: req.user._id }).lean();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const activePipelines = pipelines.filter((p) => p.status === 'Active');
    const totalPipelineValue = activePipelines.reduce((acc, curr) => acc + (curr.expectedInvestment || 0), 0);

    const activeCount = activePipelines.length;
    const highPriorityCount = activePipelines.filter((p) => p.priority === 'High' || p.priority === 'Critical').length;
    const dueDiligenceCount = activePipelines.filter((p) => p.stage === 'Due Diligence').length;
    const decisionCount = activePipelines.filter((p) => p.stage === 'Decision').length;
    const investedCount = pipelines.filter((p) => p.stage === 'Invested').length;
    const passedCount = pipelines.filter((p) => p.stage === 'Passed').length;

    let followUpDueTodayCount = 0;
    let followUpOverdueCount = 0;

    activePipelines.forEach((p) => {
      if (p.nextFollowUpDate) {
        const fDate = new Date(p.nextFollowUpDate);
        if (fDate >= startOfDay && fDate <= endOfDay) followUpDueTodayCount++;
        else if (fDate < startOfDay) followUpOverdueCount++;
      }
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalPipelineValue,
        activeCount,
        highPriorityCount,
        dueDiligenceCount,
        decisionCount,
        investedCount,
        passedCount,
        followUpDueTodayCount,
        followUpOverdueCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdatePipeline,
  getMyPipelines,
  getPipelineByStartup,
  updatePipelineStage,
  deletePipeline,
  getPipelineAnalytics,
};
