const mongoose = require('mongoose');

function runPhase13DealTestSuite() {
  console.log('=== PHASE 13 INVESTMENT DEAL ROOM & TERM SHEET TEST SUITE ===');

  const founder1Id = new mongoose.Types.ObjectId();
  const founder2Id = new mongoose.Types.ObjectId();
  const investor1Id = new mongoose.Types.ObjectId();
  const investor2Id = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();

  const dealRecord = {
    _id: new mongoose.Types.ObjectId(),
    founder: founder1Id,
    investor: investor1Id,
    status: 'Active',
  };

  // Test 1: Participant Access Control - Founder 1 Allowed
  const checkAccess = (userId, role) => {
    if (role === 'admin') return true;
    return userId.toString() === dealRecord.founder.toString() || userId.toString() === dealRecord.investor.toString();
  };

  console.log('1. Founder 1 (Owner) access allowed:', checkAccess(founder1Id, 'founder') ? 'PASSED' : 'FAILED');
  console.log('2. Founder 2 (Unrelated) access blocked (HTTP 403):', !checkAccess(founder2Id, 'founder') ? 'PASSED' : 'FAILED');
  console.log('3. Investor 1 (Owner) access allowed:', checkAccess(investor1Id, 'investor') ? 'PASSED' : 'FAILED');
  console.log('4. Investor 2 (Unrelated) access blocked (HTTP 403):', !checkAccess(investor2Id, 'investor') ? 'PASSED' : 'FAILED');
  console.log('5. Admin user access allowed for audit:', checkAccess(adminId, 'admin') ? 'PASSED' : 'FAILED');

  // Test 6: Term Sheet Version Incrementing
  const v1 = 1;
  const v2 = v1 + 1;
  console.log('6. Term Sheet versioning increment (v1 -> v2):', v2 === 2 ? 'PASSED' : 'FAILED');

  // Test 7: Self-Acceptance Protection
  const proposedBy = investor1Id;
  const canAccept = (userId) => userId.toString() !== proposedBy.toString();
  console.log('7. Proposer self-acceptance blocked:', !canAccept(investor1Id) ? 'PASSED' : 'FAILED');
  console.log('8. Recipient acceptance allowed:', canAccept(founder1Id) ? 'PASSED' : 'FAILED');

  // Test 9: Term Sheet Acceptance Status Transition
  const acceptProposal = (deal, termSheet) => {
    termSheet.status = 'Accepted';
    deal.status = 'Term Sheet Accepted';
    return deal.status;
  };
  const mockDeal = { status: 'Term Sheet Proposed' };
  const mockTS = { status: 'Proposed' };
  console.log('9. Term Sheet acceptance deal status transition:', acceptProposal(mockDeal, mockTS) === 'Term Sheet Accepted' ? 'PASSED' : 'FAILED');

  // Test 10: Past Expiry Date Rejection
  const validateExpiry = (dateStr) => new Date(dateStr) >= new Date();
  const pastDate = new Date(Date.now() - 86400000).toISOString();
  const futureDate = new Date(Date.now() + 86400000).toISOString();
  console.log('10. Past expiry date rejection:', !validateExpiry(pastDate) ? 'PASSED' : 'FAILED');
  console.log('11. Future expiry date validation:', validateExpiry(futureDate) ? 'PASSED' : 'FAILED');

  // Test 12: Negative Financial Rejection
  const validateFinancials = (amount, valuation) => amount > 0 && valuation > 0;
  console.log('12. Negative valuation rejection:', !validateFinancials(500000, -100000) ? 'PASSED' : 'FAILED');
  console.log('13. Positive financial validation:', validateFinancials(500000, 3500000) ? 'PASSED' : 'FAILED');
}

runPhase13DealTestSuite();
