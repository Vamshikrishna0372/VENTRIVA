const mongoose = require('mongoose');
const User = require('../models/User');
const Startup = require('../models/Startup');
const Shortlist = require('../models/Shortlist');
const Evaluation = require('../models/Evaluation');
const PipelineEntry = require('../models/PipelineEntry');
const Document = require('../models/Document');
const DueDiligenceChecklist = require('../models/DueDiligenceChecklist');
const DocumentRequest = require('../models/DocumentRequest');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const InvestorInterest = require('../models/InvestorInterest');
const Meeting = require('../models/Meeting');
const ModerationFlag = require('../models/ModerationFlag');

const analyticsService = {
  /**
   * Calculate real founder analytics
   */
  async getFounderAnalytics(founderId) {
    const founder = await User.findById(founderId).lean();
    if (!founder) throw new Error('Founder user not found');

    const startup = await Startup.findOne({ founder: founderId, isDeleted: false }).lean();

    const founderCompletion = founder.profileCompletion || (founder.bio ? 100 : 60);
    const startupCompletion = startup ? startup.profileCompletion : 0;

    let interestsCount = 0;
    let acceptedInterests = 0;
    let pendingInterests = 0;
    let documentsCount = 0;
    let documentRequestsCount = 0;

    if (startup) {
      const interests = await InvestorInterest.find({ startup: startup._id }).lean();
      interestsCount = interests.length;
      acceptedInterests = interests.filter((i) => i.status === 'Accepted').length;
      pendingInterests = interests.filter((i) => i.status === 'Interested').length;

      documentsCount = await Document.countDocuments({ startup: startup._id });
      documentRequestsCount = await DocumentRequest.countDocuments({ startup: startup._id });
    }

    const conversations = await Conversation.find({ founder: founderId }).lean();
    const conversationsCount = conversations.length;
    const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCountFounder || 0), 0);

    const meetings = await Meeting.find({ founder: founderId }).lean();
    const confirmedMeetings = meetings.filter((m) => m.status === 'Confirmed').length;
    const upcomingMeetings = meetings.filter((m) => m.status === 'Confirmed' && new Date(m.scheduledStart) > new Date()).length;

    return {
      profileHealth: {
        founderCompletion,
        startupCompletion,
        publicationStatus: startup ? (startup.isPublished ? 'Published' : 'Draft') : 'No Startup',
        verificationStatus: startup ? startup.verificationStatus : 'Unverified',
      },
      startupMetrics: startup
        ? {
            startupName: startup.startupName,
            sector: startup.sector,
            stage: startup.stage,
            businessModel: startup.businessModel,
            teamSize: startup.teamSize || 1,
            monthlyRevenue: startup.monthlyRevenue || 0,
            annualRevenue: startup.annualRevenue || 0,
            revenueGrowth: startup.revenueGrowth || 0,
            fundingRequired: startup.fundingRequired || 0,
            previousFunding: startup.previousFunding || 0,
          }
        : null,
      engagement: {
        interestsCount,
        acceptedInterests,
        pendingInterests,
        conversationsCount,
        unreadMessages,
        meetingsCount: meetings.length,
        confirmedMeetings,
        upcomingMeetings,
        documentsCount,
        documentRequestsCount,
      },
    };
  },

  /**
   * Calculate real investor portfolio & deal intelligence analytics
   */
  async getInvestorAnalytics(investorId) {
    const shortlists = await Shortlist.find({ investor: investorId, isArchived: false }).lean();
    const shortlistedCount = shortlists.length;

    const pipelines = await PipelineEntry.find({ investor: investorId }).lean();
    const activeDealsCount = pipelines.filter((p) => !['Passed', 'Closed Out'].includes(p.stage)).length;
    const investedDealsCount = pipelines.filter((p) => p.stage === 'Closed Won' || p.stage === 'Term Sheet Signed').length;
    const expectedPipelineValue = pipelines.reduce((acc, p) => acc + (p.expectedInvestmentAmount || 0), 0);

    const dueDiligenceDealsCount = pipelines.filter((p) => p.stage === 'Due Diligence').length;

    const evaluations = await Evaluation.find({ investor: investorId }).lean();
    const completedEvaluations = evaluations.filter((e) => e.status === 'Completed');
    const totalEvaluationsCount = evaluations.length;

    let avgEvaluationScore = 0;
    if (completedEvaluations.length > 0) {
      const sum = completedEvaluations.reduce((acc, e) => acc + (e.overallWeightedScore || 0), 0);
      avgEvaluationScore = Number((sum / completedEvaluations.length).toFixed(1));
    }

    const interests = await InvestorInterest.find({ investor: investorId }).lean();
    const conversations = await Conversation.find({ investor: investorId }).lean();
    const meetings = await Meeting.find({ investor: investorId }).lean();
    const upcomingMeetings = meetings.filter((m) => m.status === 'Confirmed' && new Date(m.scheduledStart) > new Date()).length;

    const ddChecklists = await DueDiligenceChecklist.find({ investor: investorId }).lean();

    const discoveredCount = await Startup.countDocuments({ isPublished: true, isDeleted: false, profileVisibility: { $ne: 'Private' } });

    // Deal Funnel counts
    const funnel = {
      discovered: Math.max(discoveredCount, shortlistedCount, pipelines.length),
      shortlisted: shortlistedCount,
      evaluated: totalEvaluationsCount,
      interested: interests.length,
      dueDiligence: dueDiligenceDealsCount,
      invested: investedDealsCount,
    };

    return {
      overview: {
        activeDealsCount,
        shortlistedCount,
        totalEvaluationsCount,
        avgEvaluationScore,
        expectedPipelineValue,
        dueDiligenceDealsCount,
        investedDealsCount,
      },
      funnel,
      engagement: {
        interestsSubmitted: interests.length,
        conversationsCount: conversations.length,
        meetingsCount: meetings.length,
        upcomingMeetings,
        ddChecklistsCount: ddChecklists.length,
      },
      pipelineDistribution: pipelines.reduce((acc, p) => {
        acc[p.stage] = (acc[p.stage] || 0) + 1;
        return acc;
      }, {}),
    };
  },

  /**
   * Calculate real admin platform analytics
   */
  async getAdminOverviewAnalytics(period = 'all') {
    const totalUsers = await User.countDocuments();
    const foundersCount = await User.countDocuments({ role: 'founder' });
    const investorsCount = await User.countDocuments({ role: 'investor' });

    const totalStartups = await Startup.countDocuments({ isDeleted: false });
    const publishedStartups = await Startup.countDocuments({ isPublished: true, isDeleted: false });
    const verifiedStartups = await Startup.countDocuments({ isVerified: true, isDeleted: false });

    const totalShortlists = await Shortlist.countDocuments({ isArchived: false });
    const totalEvaluations = await Evaluation.countDocuments();
    const totalPipelines = await PipelineEntry.countDocuments();
    const totalInterests = await InvestorInterest.countDocuments();
    const totalMeetings = await Meeting.countDocuments();

    const sectorBreakdown = await Startup.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$sector', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const stageBreakdown = await Startup.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const openFlags = await ModerationFlag.countDocuments({ status: 'Open' });

    return {
      users: {
        total: totalUsers,
        founders: foundersCount,
        investors: investorsCount,
      },
      startups: {
        total: totalStartups,
        published: publishedStartups,
        verified: verifiedStartups,
        sectorBreakdown,
        stageBreakdown,
      },
      investorActivity: {
        shortlists: totalShortlists,
        evaluations: totalEvaluations,
        pipelines: totalPipelines,
        interests: totalInterests,
        meetings: totalMeetings,
      },
      moderation: {
        openFlags,
      },
    };
  },
};

module.exports = analyticsService;
