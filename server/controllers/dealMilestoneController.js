const Deal = require('../models/Deal');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Create a new closing milestone checklist task embedded in Deal
 * @route   POST /api/deals/:dealId/milestones
 * @access  Private (Participants)
 */
const createMilestone = async (req, res, next) => {
  try {
    const { dealId } = req.params;
    const { title, dueDate } = req.body;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    const milestone = {
      title,
      targetDate: dueDate ? new Date(dueDate) : null,
      status: 'Pending',
      createdAt: new Date(),
    };

    deal.milestones = deal.milestones || [];
    deal.milestones.push(milestone);
    await deal.save();

    await ActivityLog.create({
      activityType: 'deal',
      deal: dealId,
      startup: deal.startup,
      actor: req.user._id,
      action: 'MILESTONE_CREATED',
      description: `Closing milestone created: "${title}"`,
    });

    const created = deal.milestones[deal.milestones.length - 1];

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get closing milestones for a Deal Room
 * @route   GET /api/deals/:dealId/milestones
 * @access  Private (Participants + Admin)
 */
const getMilestonesForDeal = async (req, res, next) => {
  try {
    const { dealId } = req.params;
    const deal = await Deal.findById(dealId).lean();
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    res.status(200).json({
      success: true,
      count: (deal.milestones || []).length,
      data: deal.milestones || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update milestone status (Completed / Pending)
 * @route   PATCH /api/deals/:dealId/milestones/:id
 * @access  Private (Participants)
 */
const updateMilestoneStatus = async (req, res, next) => {
  try {
    const { dealId, id } = req.params;
    const { status } = req.body;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal Room not found' });
    }

    const milestone = deal.milestones.id(id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    milestone.status = status;
    if (status === 'Completed') {
      milestone.completedAt = new Date();
    }
    await deal.save();

    await ActivityLog.create({
      activityType: 'deal',
      deal: dealId,
      startup: deal.startup,
      actor: req.user._id,
      action: 'MILESTONE_UPDATED',
      description: `Milestone "${milestone.title}" updated to ${status}`,
    });

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete milestone task
 * @route   DELETE /api/deals/:dealId/milestones/:id
 * @access  Private (Participants)
 */
const deleteMilestone = async (req, res, next) => {
  try {
    const { dealId, id } = req.params;
    const deal = await Deal.findById(dealId);
    if (deal && deal.milestones) {
      deal.milestones.pull(id);
      await deal.save();
    }

    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMilestone,
  getMilestonesForDeal,
  updateMilestoneStatus,
  deleteMilestone,
};
