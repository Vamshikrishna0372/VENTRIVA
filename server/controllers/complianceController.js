const ComplianceItem = require('../models/ComplianceItem');
const Startup = require('../models/Startup');
const complianceService = require('../services/complianceService');
const governanceService = require('../services/governanceService');

exports.getComplianceItems = async (req, res, next) => {
  try {
    const { startupId } = req.query;
    let targetStartup = startupId;

    if (!targetStartup && req.user.role === 'founder') {
      const startup = await Startup.findOne({ founder: req.user._id });
      if (startup) targetStartup = startup._id;
    }

    if (targetStartup) {
      await complianceService.checkOverdueCompliance(targetStartup);
    }

    const filter = targetStartup ? { startup: targetStartup } : {};
    const items = await ComplianceItem.find(filter).sort({ dueDate: 1 }).lean();
    const metrics = targetStartup ? await complianceService.getComplianceMetrics(targetStartup) : null;

    res.status(200).json({
      success: true,
      count: items.length,
      metrics,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

exports.addComplianceItem = async (req, res, next) => {
  try {
    const { startupId, category, title, description, priority, dueDate } = req.body;
    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    const item = await ComplianceItem.create({
      startup: startup._id,
      category: category || 'Corporate',
      title,
      description: description || '',
      priority: priority || 'Medium',
      dueDate: new Date(dueDate),
      assignedTo: req.user._id,
      status: 'Pending',
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateComplianceStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const item = await ComplianceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Compliance item not found' });

    item.status = status;
    if (notes) item.notes = notes;
    if (status === 'Completed') item.completedDate = new Date();

    await item.save();

    if (status === 'Completed') {
      await governanceService.recordActivity({
        startupId: item.startup,
        actorId: req.user._id,
        eventType: 'COMPLIANCE_COMPLETED',
        entityType: 'ComplianceItem',
        entityId: item._id,
        description: `Completed compliance item '${item.title}'`,
      });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
