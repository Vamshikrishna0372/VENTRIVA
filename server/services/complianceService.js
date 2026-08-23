const ComplianceItem = require('../models/ComplianceItem');
const Document = require('../models/Document');
const governanceService = require('./governanceService');

class ComplianceService {
  /**
   * Calculate compliance metrics & percentage score for a startup
   */
  async getComplianceMetrics(startupId) {
    const items = await ComplianceItem.find({ startup: startupId }).lean();
    if (!items || items.length === 0) {
      return {
        startupId,
        totalItems: 0,
        completedItems: 0,
        pendingItems: 0,
        overdueItems: 0,
        compliancePercentage: 100,
        highPriorityOverdue: 0,
        upcomingDeadlines: [],
      };
    }

    const now = new Date();
    let completed = 0;
    let pending = 0;
    let overdue = 0;
    let highPriorityOverdue = 0;

    items.forEach((item) => {
      if (item.status === 'Completed' || item.status === 'Waived') {
        completed++;
      } else if (new Date(item.dueDate) < now) {
        overdue++;
        if (item.priority === 'High' || item.priority === 'Critical') highPriorityOverdue++;
      } else {
        pending++;
      }
    });

    const total = items.length;
    const compliancePercentage = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 100;

    const upcomingDeadlines = items
      .filter((i) => i.status !== 'Completed' && new Date(i.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    return {
      startupId,
      totalItems: total,
      completedItems: completed,
      pendingItems: pending,
      overdueItems: overdue,
      compliancePercentage,
      highPriorityOverdue,
      upcomingDeadlines,
    };
  }

  /**
   * Automatically update overdue status for items past due date
   */
  async checkOverdueCompliance(startupId) {
    const now = new Date();
    const overdueItems = await ComplianceItem.find({
      startup: startupId,
      status: 'Pending',
      dueDate: { $lt: now },
    });

    for (const item of overdueItems) {
      item.status = 'Overdue';
      await item.save();

      await governanceService.recordActivity({
        startupId,
        actorId: item.assignedTo || item._id,
        eventType: 'COMPLIANCE_OVERDUE',
        entityType: 'ComplianceItem',
        entityId: item._id,
        description: `Compliance item '${item.title}' is overdue! (Due: ${new Date(item.dueDate).toLocaleDateString()})`,
      });
    }

    return overdueItems.length;
  }
}

module.exports = new ComplianceService();
