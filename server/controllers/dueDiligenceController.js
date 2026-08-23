const mongoose = require('mongoose');
const DueDiligenceChecklist = require('../models/DueDiligenceChecklist');
const Startup = require('../models/Startup');
const { DEFAULT_DD_CHECKLIST_TEMPLATE } = require('../config/documentConstants');

/**
 * @desc    Get or initialize investor due diligence checklist for a startup
 * @route   GET /api/due-diligence/:startupId
 * @access  Private (Investor)
 */
const getDueDiligenceChecklist = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid Startup ObjectId format' });
    }

    const startup = await Startup.findById(startupId);
    if (!startup || startup.isDeleted || !startup.isPublished) {
      return res.status(404).json({ success: false, message: 'Startup profile unavailable for due diligence' });
    }

    let checklist = await DueDiligenceChecklist.findOne({ startup: startup._id, investor: req.user._id }).populate('items.document', 'title category fileName fileSize');

    if (!checklist) {
      // Initialize default template items
      const items = DEFAULT_DD_CHECKLIST_TEMPLATE.map((tpl) => ({
        category: tpl.category,
        title: tpl.title,
        description: tpl.description,
        status: 'Not Started',
      }));

      checklist = await DueDiligenceChecklist.create({
        startup: startup._id,
        investor: req.user._id,
        items,
        overallStatus: 'In Progress',
      });
    }

    const total = checklist.items.length;
    const completed = checklist.items.filter((i) => i.status === 'Complete' || i.status === 'Not Applicable').length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      checklist,
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update due diligence checklist item
 * @route   PATCH /api/due-diligence/:startupId/items/:itemId
 * @access  Private (Investor)
 */
const updateChecklistItem = async (req, res, next) => {
  try {
    const { startupId, itemId } = req.params;
    const { status, investorNote, documentId } = req.body;

    let checklist = await DueDiligenceChecklist.findOne({ startup: startupId, investor: req.user._id });
    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Due diligence checklist not found' });
    }

    const item = checklist.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found' });
    }

    if (status) item.status = status;
    if (investorNote !== undefined) item.investorNote = investorNote.trim();
    if (documentId) item.document = documentId;
    if (status === 'Complete') item.completedAt = new Date();

    const total = checklist.items.length;
    const completed = checklist.items.filter((i) => i.status === 'Complete').length;
    if (completed === total) checklist.overallStatus = 'Complete';
    else checklist.overallStatus = 'In Progress';

    await checklist.save();

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      message: 'Checklist item updated successfully',
      checklist,
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all due diligence workspaces for current investor
 * @route   GET /api/due-diligence/my
 * @access  Private (Investor)
 */
const getMyDueDiligenceWorkspaces = async (req, res, next) => {
  try {
    const checklists = await DueDiligenceChecklist.find({ investor: req.user._id })
      .populate({ path: 'startup', select: 'startupName sector stage logo tagline' })
      .lean();

    const items = checklists
      .filter((c) => c.startup)
      .map((c) => {
        const total = c.items.length;
        const completed = c.items.filter((i) => i.status === 'Complete' || i.status === 'Not Applicable').length;
        return {
          ...c,
          completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      });

    res.status(200).json({
      success: true,
      count: items.length,
      workspaces: items,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDueDiligenceChecklist,
  updateChecklistItem,
  getMyDueDiligenceWorkspaces,
};
