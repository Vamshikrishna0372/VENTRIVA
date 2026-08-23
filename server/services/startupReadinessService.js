const Startup = require('../models/Startup');
const User = require('../models/User');
const TeamMember = require('../models/TeamMember');
const Document = require('../models/Document');
const Shareholding = require('../models/Shareholding');
const BoardMember = require('../models/BoardMember');

/**
 * Startup Investment Readiness Score Engine
 * Weighted 9-dimension model (0 - 100%)
 */
const calculateInvestmentReadiness = async (startupId, founderUserId) => {
  const startup = await Startup.findById(startupId).lean();
  const founderUser = founderUserId ? await User.findById(founderUserId).lean() : null;
  const teamMembers = await TeamMember.find({ startup: startupId, isDeleted: false }).lean();
  const documents = await Document.find({ startup: startupId, isDeleted: false }).lean();
  const shareholdings = await Shareholding.find({ startup: startupId, isActive: true }).lean();
  const boardMembers = await BoardMember.find({ startup: startupId, isActive: true }).lean();

  const completedItems = [];
  const missingItems = [];
  const recommendedActions = [];

  // 1. Profile & Basic Info (10%)
  let profileScore = 0;
  if (startup?.startupName && startup.startupName.trim().length > 0) profileScore += 3;
  else missingItems.push('Startup Name');

  if (startup?.tagline && startup.tagline.trim().length > 5) profileScore += 3;
  else missingItems.push('Startup Tagline');

  if (startup?.description && startup.description.trim().length > 20) profileScore += 4;
  else missingItems.push('Detailed Description');

  if (profileScore === 10) completedItems.push('Startup Profile & Overview');

  // 2. Team & Leadership (10%)
  let teamScore = 0;
  if (founderUser?.bio && founderUser.bio.trim().length > 10) teamScore += 4;
  else missingItems.push('Founder Bio');

  if (founderUser?.linkedin && founderUser.linkedin.trim().length > 5) teamScore += 3;
  else missingItems.push('Founder LinkedIn Profile');

  if (teamMembers.length > 0) teamScore += 3;
  else {
    missingItems.push('Key Executive Team Members');
    recommendedActions.push({
      title: 'Add Key Executive Team Members',
      description: 'Investors look for balanced founder and executive team composition.',
      category: 'Team',
      targetRoute: '/founder/startup',
    });
  }

  if (teamScore === 10) completedItems.push('Team & Leadership Profile');

  // 3. Market & Business Model (10%)
  let marketScore = 0;
  if (startup?.sector) marketScore += 3;
  else missingItems.push('Primary Industry Sector');

  if (startup?.stage) marketScore += 3;
  else missingItems.push('Venture Stage');

  if (startup?.businessModel) marketScore += 4;
  else missingItems.push('Business Model');

  if (marketScore === 10) completedItems.push('Market Classification & Business Model');

  // 4. Traction & Operational Metrics (15%)
  let tractionScore = 0;
  if (startup?.tractionSummary && startup.tractionSummary.trim().length > 10) tractionScore += 7;
  else missingItems.push('Traction Overview');

  if ((startup?.customerCount || 0) > 0 || (startup?.userCount || 0) > 0) tractionScore += 4;
  else missingItems.push('Customer / Active User Metrics');

  if ((startup?.monthlyRevenue || 0) > 0 || (startup?.annualRevenue || 0) > 0) tractionScore += 4;

  if (tractionScore >= 11) completedItems.push('Traction & Operating Metrics');

  // 5. Financial & Revenue Readiness (15%)
  let financialScore = 0;
  if ((startup?.arr || 0) > 0 || (startup?.mrr || 0) > 0 || (startup?.monthlyRevenue || 0) > 0) financialScore += 8;
  else {
    missingItems.push('ARR / MRR Revenue Financials');
    recommendedActions.push({
      title: 'Update ARR & Revenue Financials',
      description: 'Provide ARR, MRR, or monthly revenue metrics to increase investor discovery ranking.',
      category: 'Financials',
      targetRoute: '/founder/startup',
    });
  }

  if (startup?.valuation > 0) financialScore += 4;
  else missingItems.push('Current Enterprise Valuation');

  if (startup?.burnRate !== undefined && startup?.runwayMonths !== undefined) financialScore += 3;
  else missingItems.push('Burn Rate & Cash Runway Months');

  if (financialScore >= 12) completedItems.push('Financial & Valuation Metrics');

  // 6. Fundraising Target & Terms (10%)
  let fundraisingScore = 0;
  if (startup?.fundraisingStatus && startup.fundraisingStatus !== 'Not Raising') fundraisingScore += 5;
  else missingItems.push('Active Fundraising Status');

  if ((startup?.fundingRequired || 0) > 0) fundraisingScore += 5;
  else {
    missingItems.push('Target Capital Raise Amount');
    recommendedActions.push({
      title: 'Specify Target Capital Raise Amount',
      description: 'Define your target fundraising amount to qualify for syndicate matching.',
      category: 'Fundraising',
      targetRoute: '/founder/fundraising',
    });
  }

  if (fundraisingScore === 10) completedItems.push('Fundraising Round Terms');

  // 7. Virtual Data Room Readiness (10%)
  let dataRoomScore = 0;
  if (documents.length > 0) dataRoomScore += 5;
  else {
    missingItems.push('Virtual Data Room Documents');
    recommendedActions.push({
      title: 'Upload Pitch Deck & Financial Model to VDR',
      description: 'Upload your pitch deck and cap table to the Virtual Data Room for institutional diligence.',
      category: 'Data Room',
      targetRoute: '/founder/documents',
    });
  }

  const docCategories = new Set(documents.map((d) => d.category));
  if (docCategories.has('Pitch Deck') || docCategories.has('Financials') || docCategories.has('Legal')) dataRoomScore += 5;

  if (dataRoomScore === 10) completedItems.push('Virtual Data Room & Due Diligence Files');

  // 8. Cap Table Hygiene (10%)
  let capTableScore = 0;
  if (shareholdings.length > 0) capTableScore += 10;
  else {
    missingItems.push('Cap Table Shareholding Distribution');
    recommendedActions.push({
      title: 'Configure Cap Table Shareholdings',
      description: 'Set up founder and investor shareholdings in the Cap Table module.',
      category: 'Cap Table',
      targetRoute: '/founder/cap-table',
    });
  }

  if (capTableScore === 10) completedItems.push('Cap Table & Equity Structure');

  // 9. Governance & Corporate Legal (10%)
  let governanceScore = 0;
  if (boardMembers.length > 0) governanceScore += 10;
  else {
    missingItems.push('Board of Directors Configuration');
    recommendedActions.push({
      title: 'Establish Board of Directors',
      description: 'Add director seats to demonstrate formal corporate governance.',
      category: 'Governance',
      targetRoute: '/founder/governance',
    });
  }

  if (governanceScore === 10) completedItems.push('Corporate Governance & Board Structure');

  // Compute Overall Score (0-100%)
  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        profileScore +
          teamScore +
          marketScore +
          tractionScore +
          financialScore +
          fundraisingScore +
          dataRoomScore +
          capTableScore +
          governanceScore
      )
    )
  );

  return {
    overallScore,
    categoryScores: {
      profile: { name: 'Profile & Overview', score: profileScore, maxScore: 10, status: profileScore === 10 ? 'Complete' : 'Needs Work' },
      team: { name: 'Team & Leadership', score: teamScore, maxScore: 10, status: teamScore === 10 ? 'Complete' : 'Needs Work' },
      market: { name: 'Market & Model', score: marketScore, maxScore: 10, status: marketScore === 10 ? 'Complete' : 'Needs Work' },
      traction: { name: 'Traction & Metrics', score: tractionScore, maxScore: 15, status: tractionScore >= 11 ? 'Complete' : 'Needs Work' },
      financials: { name: 'Financial Readiness', score: financialScore, maxScore: 15, status: financialScore >= 12 ? 'Complete' : 'Needs Work' },
      fundraising: { name: 'Fundraising Terms', score: fundraisingScore, maxScore: 10, status: fundraisingScore === 10 ? 'Complete' : 'Needs Work' },
      dataRoom: { name: 'Virtual Data Room', score: dataRoomScore, maxScore: 10, status: dataRoomScore === 10 ? 'Complete' : 'Needs Work' },
      capTable: { name: 'Cap Table Hygiene', score: capTableScore, maxScore: 10, status: capTableScore === 10 ? 'Complete' : 'Needs Work' },
      governance: { name: 'Corporate Governance', score: governanceScore, maxScore: 10, status: governanceScore === 10 ? 'Complete' : 'Needs Work' },
    },
    completedItems,
    missingItems,
    recommendedActions,
    lastCalculatedAt: new Date().toISOString(),
  };
};

module.exports = {
  calculateInvestmentReadiness,
};
