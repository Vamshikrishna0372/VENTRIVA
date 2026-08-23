/**
 * Profile Completion Calculation Engine
 */

const calculateProfileCompletion = (startup, founderUser = null, teamMembersCount = 0) => {
  let score = 0;
  const missingFields = [];

  // 1. Founder Information (15%)
  if (founderUser) {
    let founderPoints = 0;
    if (founderUser.bio && founderUser.bio.trim().length > 10) founderPoints += 5;
    else missingFields.push('Founder Bio');

    if (founderUser.linkedin && founderUser.linkedin.trim().length > 5) founderPoints += 5;
    else missingFields.push('Founder LinkedIn');

    if (founderUser.professionalTitle && founderUser.professionalTitle.trim().length > 2) founderPoints += 5;
    else missingFields.push('Founder Title');

    score += founderPoints;
  } else {
    missingFields.push('Founder Profile');
  }

  if (!startup) {
    return { percentage: Math.min(100, score), missingFields };
  }

  // 2. Basic Startup Information (20%)
  let basicPoints = 0;
  if (startup.startupName && startup.startupName.trim().length > 0) basicPoints += 5;
  else missingFields.push('Startup Name');

  if (startup.tagline && startup.tagline.trim().length > 5) basicPoints += 5;
  else missingFields.push('Startup Tagline');

  if (startup.description && startup.description.trim().length > 20) basicPoints += 8;
  else missingFields.push('Detailed Description');

  if (startup.foundedYear) basicPoints += 2;
  else missingFields.push('Founded Year');

  score += basicPoints;

  // 3. Classification (15%)
  let classPoints = 0;
  if (startup.sector) classPoints += 5;
  else missingFields.push('Sector');

  if (startup.subSector) classPoints += 3;
  else missingFields.push('Sub-sector');

  if (startup.stage) classPoints += 4;
  else missingFields.push('Startup Stage');

  if (startup.businessModel) classPoints += 3;
  else missingFields.push('Business Model');

  score += classPoints;

  // 4. Location (10%)
  let locPoints = 0;
  if (startup.country) locPoints += 5;
  else missingFields.push('Country');

  if (startup.city || startup.locationDisplay) locPoints += 5;
  else missingFields.push('City / Location');

  score += locPoints;

  // 5. Online Presence (10%)
  let onlinePoints = 0;
  if (startup.website && startup.website.trim().length > 5) onlinePoints += 6;
  else missingFields.push('Company Website');

  if (startup.linkedin && startup.linkedin.trim().length > 5) onlinePoints += 4;
  else missingFields.push('Company LinkedIn');

  score += onlinePoints;

  // 6. Traction (15%)
  let tractionPoints = 0;
  if (startup.tractionSummary && startup.tractionSummary.trim().length > 10) tractionPoints += 7;

  if (startup.monthlyRevenue > 0 || startup.annualRevenue > 0 || startup.customerCount > 0 || startup.userCount > 0) {
    tractionPoints += 8;
  } else if (!startup.tractionSummary) {
    missingFields.push('Traction & Revenue Details');
  }

  score += Math.min(15, tractionPoints);

  // 7. Fundraising (10%)
  let fundPoints = 0;
  if (startup.fundraisingStatus === 'Not Raising') {
    fundPoints = 10;
  } else {
    if (startup.fundraisingStatus) fundPoints += 4;
    if (startup.fundingRequired > 0 || startup.fundraisingSummary) fundPoints += 6;
    else missingFields.push('Target Raise Details');
  }
  score += fundPoints;

  // 8. Team Members (5%)
  if (teamMembersCount > 0) {
    score += 5;
  } else {
    missingFields.push('Team Members');
  }

  const percentage = Math.min(100, Math.max(0, Math.round(score)));
  return { percentage, missingFields };
};

module.exports = {
  calculateProfileCompletion,
};
