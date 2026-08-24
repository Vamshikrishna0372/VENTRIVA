const mongoose = require('mongoose');
const Evaluation = require('../models/Evaluation');
const PipelineEntry = require('../models/PipelineEntry');
const DocumentRequest = require('../models/DocumentRequest');
const Meeting = require('../models/Meeting');
const DueDiligenceChecklist = require('../models/DueDiligenceChecklist');

const investorInsightService = {
  /**
   * Generate rule-based insights for investor
   */
  async generateInvestorInsights(investorId) {
    const insights = [];
    const now = new Date();

    // Rule 1: High-conviction opportunity (Evaluation score >= 7.5 or High Potential)
    const highEvaluations = await Evaluation.find({
      investor: investorId,
      $or: [{ overallScore: { $gte: 7.5 } }, { investmentDecision: 'High Potential' }],
    })
      .populate('startup', 'startupName sector stage logo')
      .lean();

    for (const ev of highEvaluations) {
      if (ev.startup) {
        insights.push({
          id: `eval-high-${ev._id}`,
          title: `High-Conviction Opportunity: ${ev.startup.startupName}`,
          description: `Venture evaluated with a strong score of ${(ev.overallScore || 0).toFixed(1)}/10 (${ev.investmentDecision || 'High Priority'}).`,
          priority: 'high',
          type: 'evaluation',
          startupId: ev.startup._id,
          startupName: ev.startup.startupName,
          actionLabel: 'View Evaluation',
          actionUrl: `/investor/startups/${ev.startup._id}/evaluate`,
          createdAt: ev.updatedAt,
        });
      }
    }

    // Rule 2: Overdue pipeline follow-up
    const overduePipelines = await PipelineEntry.find({
      investor: investorId,
      nextFollowUpDate: { $lt: now },
      stage: { $nin: ['Passed', 'Closed Out', 'Closed Won'] },
    })
      .populate('startup', 'startupName')
      .lean();

    for (const pipe of overduePipelines) {
      if (pipe.startup) {
        insights.push({
          id: `pipe-overdue-${pipe._id}`,
          title: `Follow-up Overdue: ${pipe.startup.startupName}`,
          description: `Planned follow-up date was ${new Date(pipe.nextFollowUpDate).toLocaleDateString()}. Update deal status.`,
          priority: 'medium',
          type: 'pipeline',
          startupId: pipe.startup._id,
          startupName: pipe.startup.startupName,
          actionLabel: 'Update Deal Pipeline',
          actionUrl: `/investor/pipeline/${pipe.startup._id}`,
          createdAt: pipe.nextFollowUpDate,
        });
      }
    }

    // Rule 3: Pending document requests
    const pendingDocReqs = await DocumentRequest.find({ investor: investorId, status: 'Requested' })
      .populate('startup', 'startupName')
      .lean();

    for (const req of pendingDocReqs) {
      if (req.startup) {
        insights.push({
          id: `doc-req-${req._id}`,
          title: `Document Request Pending: ${req.title}`,
          description: `Awaiting founder response for requested document (${req.category}) from ${req.startup.startupName}.`,
          priority: 'low',
          type: 'due_diligence',
          startupId: req.startup._id,
          startupName: req.startup.startupName,
          actionLabel: 'Track Document Requests',
          actionUrl: '/investor/document-requests',
          createdAt: req.createdAt,
        });
      }
    }

    // Rule 4: Upcoming meeting preparation
    const in48Hours = new Date(now.getTime() + 48 * 3600 * 1000);
    const upcomingMeetings = await Meeting.find({
      investor: investorId,
      status: 'Confirmed',
      scheduledStart: { $gte: now, $lte: in48Hours },
    })
      .populate('startup', 'startupName')
      .lean();

    for (const meet of upcomingMeetings) {
      if (meet.startup) {
        insights.push({
          id: `meet-prep-${meet._id}`,
          title: `Upcoming Pitch Call: ${meet.title}`,
          description: `Confirmed call with ${meet.startup.startupName} scheduled for ${new Date(meet.scheduledStart).toLocaleDateString()} ${new Date(meet.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          priority: 'critical',
          type: 'engagement',
          startupId: meet.startup._id,
          startupName: meet.startup.startupName,
          actionLabel: 'View Meeting Details',
          actionUrl: '/investor/meetings',
          createdAt: meet.scheduledStart,
        });
      }
    }

    return insights;
  },
};

module.exports = investorInsightService;
