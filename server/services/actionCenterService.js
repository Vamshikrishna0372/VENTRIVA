const Startup = require('../models/Startup');
const InvestorInterest = require('../models/InvestorInterest');
const DocumentRequest = require('../models/DocumentRequest');
const TermSheet = require('../models/TermSheet');
const ClosingCondition = require('../models/ClosingCondition');
const Meeting = require('../models/Meeting');
const Evaluation = require('../models/Evaluation');
const InvestorCommitment = require('../models/InvestorCommitment');
const ModerationFlag = require('../models/ModerationFlag');

/**
 * Role Action Center Generator
 * Derives real-time role-gated action items from MongoDB collections
 */
const getRoleActions = async (user) => {
  const actions = [];
  const now = new Date();

  if (user.role === 'founder') {
    const startup = await Startup.findOne({ founder: user._id, isDeleted: false }).lean();

    if (!startup) {
      actions.push({
        id: 'action-create-startup',
        title: 'Create Your Venture Profile',
        description: 'Complete your startup profile to unlock investor discovery and Virtual Data Room.',
        priority: 'high',
        category: 'Onboarding',
        targetRoute: '/founder/startup',
        createdAt: now.toISOString(),
      });
      return actions;
    }

    // 1. Pending Investor Interests
    const pendingInterests = await InvestorInterest.find({ startup: startup._id, status: 'Pending' }).lean();
    if (pendingInterests.length > 0) {
      actions.push({
        id: 'action-pending-interests',
        title: `Review ${pendingInterests.length} Pending Investor Interest Expression${pendingInterests.length > 1 ? 's' : ''}`,
        description: 'Venture capital teams have expressed interest in reviewing your data room.',
        priority: 'high',
        category: 'Interests',
        targetRoute: '/founder/interests',
        createdAt: now.toISOString(),
      });
    }

    // 2. Pending Diligence Document Requests
    const pendingDocRequests = await DocumentRequest.find({ startup: startup._id, status: 'Pending' }).lean();
    if (pendingDocRequests.length > 0) {
      actions.push({
        id: 'action-pending-doc-requests',
        title: `Upload ${pendingDocRequests.length} Requested Diligence Document${pendingDocRequests.length > 1 ? 's' : ''}`,
        description: 'Investors have requested specific financial or legal documents.',
        priority: 'high',
        category: 'Data Room',
        targetRoute: '/founder/documents',
        createdAt: now.toISOString(),
      });
    }

    // 3. Term Sheets Awaiting Response
    const pendingTermSheets = await TermSheet.find({
      startup: startup._id,
      status: { $in: ['Issued', 'Under Review'] },
    }).lean();
    if (pendingTermSheets.length > 0) {
      actions.push({
        id: 'action-pending-termsheets',
        title: `Respond to ${pendingTermSheets.length} Active Term Sheet Proposal${pendingTermSheets.length > 1 ? 's' : ''}`,
        description: 'Term sheets require your review, counter-proposal, or signature.',
        priority: 'urgent',
        category: 'Deals',
        targetRoute: '/founder/deals',
        createdAt: now.toISOString(),
      });
    }

    // 4. Incomplete Closing Conditions
    const pendingConditions = await ClosingCondition.find({ startup: startup._id, status: 'Pending' }).lean();
    if (pendingConditions.length > 0) {
      actions.push({
        id: 'action-pending-closing-conditions',
        title: `Complete ${pendingConditions.length} Incomplete Closing Condition${pendingConditions.length > 1 ? 's' : ''}`,
        description: 'Resolve round closing conditions to finalize investment wire transfers.',
        priority: 'high',
        category: 'Closings',
        targetRoute: '/founder/closings',
        createdAt: now.toISOString(),
      });
    }

    // 5. Confirmed Pitch Meetings Upcoming
    const upcomingMeetings = await Meeting.find({
      founder: user._id,
      status: 'Confirmed',
      meetingDate: { $gte: now },
    }).lean();
    if (upcomingMeetings.length > 0) {
      actions.push({
        id: 'action-upcoming-meetings',
        title: `${upcomingMeetings.length} Confirmed Video Pitch Call${upcomingMeetings.length > 1 ? 's' : ''} Scheduled`,
        description: 'Prepare pitch deck and join scheduled video calls with investors.',
        priority: 'medium',
        category: 'Meetings',
        targetRoute: '/founder/meetings',
        createdAt: now.toISOString(),
      });
    }
  } else if (user.role === 'investor') {
    // 1. Pending Evaluations
    const pendingEvaluations = await Evaluation.find({ investor: user._id, status: 'Draft' }).lean();
    if (pendingEvaluations.length > 0) {
      actions.push({
        id: 'action-pending-evaluations',
        title: `Complete ${pendingEvaluations.length} Incomplete Startup Evaluation${pendingEvaluations.length > 1 ? 's' : ''}`,
        description: 'Finalize multi-vector scorecards for evaluated deal opportunities.',
        priority: 'medium',
        category: 'Evaluations',
        targetRoute: '/investor/evaluations',
        createdAt: now.toISOString(),
      });
    }

    // 2. Active Commitments Awaiting Closing
    const activeCommitments = await InvestorCommitment.find({ investor: user._id, status: 'Committed' }).lean();
    if (activeCommitments.length > 0) {
      actions.push({
        id: 'action-active-commitments',
        title: `${activeCommitments.length} Investment Commitment${activeCommitments.length > 1 ? 's' : ''} Ready for Closing`,
        description: 'Review e-signatures and wire transfer conditions in the Closings portal.',
        priority: 'high',
        category: 'Closings',
        targetRoute: '/investor/closings',
        createdAt: now.toISOString(),
      });
    }

    // 3. Upcoming Pitch Calls
    const upcomingCalls = await Meeting.find({
      investor: user._id,
      status: 'Confirmed',
      meetingDate: { $gte: now },
    }).lean();
    if (upcomingCalls.length > 0) {
      actions.push({
        id: 'action-upcoming-calls',
        title: `${upcomingCalls.length} Upcoming Founder Pitch Call${upcomingCalls.length > 1 ? 's' : ''}`,
        description: 'Review startup data room prior to scheduled video calls.',
        priority: 'medium',
        category: 'Meetings',
        targetRoute: '/investor/meetings',
        createdAt: now.toISOString(),
      });
    }
  } else if (user.role === 'admin') {
    // 1. Startups Awaiting Verification
    const pendingVerifications = await Startup.find({ isDeleted: false, isVerified: false, verificationStatus: { $ne: 'Rejected' } }).lean();
    if (pendingVerifications.length > 0) {
      actions.push({
        id: 'action-admin-verifications',
        title: `${pendingVerifications.length} Startup Profile${pendingVerifications.length > 1 ? 's' : ''} Awaiting Verification`,
        description: 'Review startup submissions in the Verification Queue to grant publishing clearance.',
        priority: 'high',
        category: 'Governance',
        targetRoute: '/admin/verification',
        createdAt: now.toISOString(),
      });
    }

    // 2. Open Moderation Flags
    const openFlags = await ModerationFlag.find({ status: 'Open' }).lean();
    if (openFlags.length > 0) {
      actions.push({
        id: 'action-admin-moderation',
        title: `${openFlags.length} Open Moderation Flag${openFlags.length > 1 ? 's' : ''} Pending Review`,
        description: 'Investigate reported content or user flags in the Moderation Center.',
        priority: 'urgent',
        category: 'Moderation',
        targetRoute: '/admin/moderation',
        createdAt: now.toISOString(),
      });
    }
  }

  return actions;
};

module.exports = {
  getRoleActions,
};
