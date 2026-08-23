const Startup = require('../models/Startup');
const Document = require('../models/Document');
const InvestorInterest = require('../models/InvestorInterest');
const DocumentRequest = require('../models/DocumentRequest');
const Availability = require('../models/Availability');

const founderInsightService = {
  /**
   * Generate rule-based action recommendations for founder
   */
  async generateFounderInsights(founderId) {
    const insights = [];
    const startup = await Startup.findOne({ founder: founderId, isDeleted: false }).lean();

    if (!startup) {
      insights.push({
        id: 'no-startup',
        title: 'Create Startup Venture Profile',
        description: 'Publish your startup profile to begin receiving investor interest.',
        priority: 'critical',
        type: 'profile',
        actionLabel: 'Create Startup Profile',
        actionUrl: '/founder/startup',
      });
      return insights;
    }

    if (startup.profileCompletion < 80) {
      insights.push({
        id: 'profile-incomplete',
        title: `Profile Completion: ${startup.profileCompletion}%`,
        description: 'Complete missing metrics, market taxonomy, and team member details to boost investor discovery ranking.',
        priority: 'high',
        type: 'profile',
        actionLabel: 'Complete Startup Profile',
        actionUrl: '/founder/startup',
      });
    }

    // Check Pitch Deck
    const primaryDeck = await Document.findOne({ startup: startup._id, category: 'Pitch Deck', status: 'Active' });
    if (!primaryDeck) {
      insights.push({
        id: 'missing-pitch-deck',
        title: 'Upload Primary Pitch Deck',
        description: 'Startups with an active pitch deck receive 3x higher investor engagement in discovery search.',
        priority: 'high',
        type: 'fundraising',
        actionLabel: 'Upload Pitch Deck',
        actionUrl: '/founder/documents',
      });
    }

    // Pending Investor Interest
    const pendingInterestsCount = await InvestorInterest.countDocuments({ startup: startup._id, status: 'Interested' });
    if (pendingInterestsCount > 0) {
      insights.push({
        id: 'pending-interests',
        title: `${pendingInterestsCount} Investor Interest(s) Awaiting Response`,
        description: 'Review and accept investor interest expressions to open direct messaging threads.',
        priority: 'critical',
        type: 'engagement',
        actionLabel: 'Review Investor Interests',
        actionUrl: '/founder/interests',
      });
    }

    // Pending Document Requests
    const pendingDocReqsCount = await DocumentRequest.countDocuments({ startup: startup._id, status: 'Requested' });
    if (pendingDocReqsCount > 0) {
      insights.push({
        id: 'pending-doc-requests',
        title: `${pendingDocReqsCount} Document Request(s) Awaiting Response`,
        description: 'Investors have requested additional due-diligence materials for review.',
        priority: 'medium',
        type: 'due_diligence',
        actionLabel: 'Respond to Document Requests',
        actionUrl: '/founder/document-requests',
      });
    }

    // Weekly Availability Setup
    const slotsCount = await Availability.countDocuments({ founder: founderId, isActive: true });
    if (slotsCount === 0) {
      insights.push({
        id: 'no-availability',
        title: 'Configure Weekly Pitch Availability',
        description: 'Set your recurring weekly availability time slots so investors can schedule intro calls.',
        priority: 'medium',
        type: 'engagement',
        actionLabel: 'Configure Availability',
        actionUrl: '/founder/availability',
      });
    }

    return insights;
  },
};

module.exports = founderInsightService;
