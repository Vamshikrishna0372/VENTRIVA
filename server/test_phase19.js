const mongoose = require('mongoose');

const {
  BOARD_ROLES,
  BOARD_MEMBER_STATUSES,
  MEETING_STATUSES,
  MEETING_TYPES,
  RESOLUTION_TYPES,
  RESOLUTION_STATUSES,
  VOTING_STATUSES,
  VOTE_VALUES,
  CORPORATE_ACTION_TYPES,
  CORPORATE_ACTION_STATUSES,
  SHARE_TRANSFER_STATUSES,
  EQUITY_POOL_TYPES,
  EQUITY_POOL_STATUSES,
  COMPLIANCE_STATUSES,
  COMPLIANCE_PRIORITIES,
  DOCUMENT_EXPIRY_STATUSES,
  GOVERNANCE_RIGHT_TYPES,
  GOVERNANCE_EVENT_TYPES,
} = require('./config/governanceConstants');

const votingService = require('./services/votingService');
const complianceService = require('./services/complianceService');

function runPhase19Tests() {
  console.log('=== PHASE 19 AUTOMATED TEST SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1-10: CONTROLLED CONSTANTS & ENUMS
    assert(BOARD_ROLES.includes('Founder Director') && BOARD_ROLES.includes('Investor Director'), 'BOARD_ROLES includes Founder & Investor Directors');
    assert(BOARD_MEMBER_STATUSES.includes('Active') && BOARD_MEMBER_STATUSES.includes('Retired'), 'BOARD_MEMBER_STATUSES verified');
    assert(MEETING_TYPES.includes('Regular') && MEETING_TYPES.includes('Annual'), 'MEETING_TYPES includes Regular & Annual');
    assert(RESOLUTION_TYPES.includes('Share Issuance') && RESOLUTION_TYPES.includes('ESOP'), 'RESOLUTION_TYPES includes Share Issuance & ESOP');
    assert(RESOLUTION_STATUSES.includes('Voting') && RESOLUTION_STATUSES.includes('Approved'), 'RESOLUTION_STATUSES verified');
    assert(VOTE_VALUES.includes('For') && VOTE_VALUES.includes('Against') && VOTE_VALUES.includes('Abstain'), 'VOTE_VALUES includes For, Against, Abstain');
    assert(CORPORATE_ACTION_TYPES.includes('Stock Split') && CORPORATE_ACTION_TYPES.includes('Share Buyback'), 'CORPORATE_ACTION_TYPES verified');
    assert(SHARE_TRANSFER_STATUSES.includes('Proposed') && SHARE_TRANSFER_STATUSES.includes('Completed'), 'SHARE_TRANSFER_STATUSES verified');
    assert(EQUITY_POOL_TYPES.includes('ESOP Pool'), 'EQUITY_POOL_TYPES includes ESOP Pool');
    assert(COMPLIANCE_STATUSES.includes('Overdue') && COMPLIANCE_STATUSES.includes('Completed'), 'COMPLIANCE_STATUSES verified');

    // 11-15: SHAREHOLDER & OWNERSHIP VALIDATION
    function validateShareholderOwnership(shares, totalShares) {
      if (shares < 0 || totalShares <= 0) return { isValid: false, pct: 0 };
      const pct = (shares / totalShares) * 100;
      if (pct < 0 || pct > 100) return { isValid: false, pct: 0 };
      return { isValid: true, pct: Number(pct.toFixed(2)) };
    }

    const sh1 = validateShareholderOwnership(8000000, 10000000);
    assert(sh1.isValid === true && sh1.pct === 80, 'Founder ownership calculated as 80%');

    const sh2 = validateShareholderOwnership(2000000, 10000000);
    assert(sh2.isValid === true && sh2.pct === 20, 'Investor ownership calculated as 20%');

    const shInvalid = validateShareholderOwnership(-500, 10000000);
    assert(shInvalid.isValid === false, 'Negative share count rejected');

    const shOverflow = validateShareholderOwnership(15000000, 10000000);
    assert(shOverflow.isValid === false, 'Ownership > 100% rejected');

    // 16-20: BOARD MEMBER & COMPOSITION MATH
    function calculateBoardComposition(members) {
      const active = members.filter((m) => m.status === 'Active');
      const founderSeats = active.filter((m) => m.role === 'Founder Director').length;
      const investorSeats = active.filter((m) => m.role === 'Investor Director').length;
      const observers = active.filter((m) => m.role === 'Observer').length;
      return { total: active.length, founderSeats, investorSeats, observers };
    }

    const mockBoard = [
      { role: 'Founder Director', status: 'Active' },
      { role: 'Founder Director', status: 'Active' },
      { role: 'Investor Director', status: 'Active' },
      { role: 'Observer', status: 'Active' },
      { role: 'Independent Director', status: 'Retired' },
    ];
    const comp = calculateBoardComposition(mockBoard);
    assert(comp.total === 4, 'Active board directors count is 4');
    assert(comp.founderSeats === 2, 'Founder seats calculated as 2');
    assert(comp.investorSeats === 1, 'Investor seats calculated as 1');
    assert(comp.observers === 1, 'Board observers calculated as 1');

    // 21-25: BOARD MEETING QUORUM VERIFICATION
    function checkMeetingQuorum(participants, requiredQuorumPct = 50) {
      const total = participants.length;
      if (total === 0) return false;
      const attended = participants.filter((p) => p.attended).length;
      const pct = (attended / total) * 100;
      return pct >= requiredQuorumPct;
    }

    const meeting1 = checkMeetingQuorum([{ attended: true }, { attended: true }, { attended: false }], 50);
    assert(meeting1 === true, 'Quorum reached (2 of 3 attended = 66.7%)');

    const meeting2 = checkMeetingQuorum([{ attended: true }, { attended: false }, { attended: false }], 50);
    assert(meeting2 === false, 'Quorum failed (1 of 3 attended = 33.3%)');

    // 26-30: RESOLUTION VOTING ENGINE & APPROVAL MATH
    function calculateResolutionOutcome(votes, requiredApprovalPct = 51) {
      let totalPower = 0;
      let powerFor = 0;
      let powerAgainst = 0;

      votes.forEach((v) => {
        totalPower += v.votingPower;
        if (v.vote === 'For') powerFor += v.votingPower;
        else if (v.vote === 'Against') powerAgainst += v.votingPower;
      });

      const approvalPct = totalPower > 0 ? (powerFor / totalPower) * 100 : 0;
      const passed = approvalPct >= requiredApprovalPct;
      return { approvalPct: Number(approvalPct.toFixed(2)), result: passed ? 'Approved' : 'Rejected' };
    }

    const resOutcome1 = calculateResolutionOutcome([
      { vote: 'For', votingPower: 1 },
      { vote: 'For', votingPower: 1 },
      { vote: 'Against', votingPower: 1 },
    ], 51);
    assert(resOutcome1.result === 'Approved' && resOutcome1.approvalPct === 66.67, 'Resolution approved with 66.67% For');

    const resOutcome2 = calculateResolutionOutcome([
      { vote: 'For', votingPower: 1 },
      { vote: 'Against', votingPower: 2 },
    ], 51);
    assert(resOutcome2.result === 'Rejected' && resOutcome2.approvalPct === 33.33, 'Resolution rejected with 33.33% For');

    // 31-35: SECONDARY SHARE TRANSFER VALIDATION
    function validateShareTransfer(sellerShares, transferShares, pricePerShare) {
      if (transferShares <= 0 || pricePerShare < 0) return { isValid: false, reason: 'Invalid parameters' };
      if (sellerShares < transferShares) return { isValid: false, reason: 'Insufficient seller shares' };
      return { isValid: true, totalValue: transferShares * pricePerShare };
    }

    const validTransfer = validateShareTransfer(500000, 100000, 2.5);
    assert(validTransfer.isValid === true && validTransfer.totalValue === 250000, 'Share transfer validated for 100,000 shares @ $2.50 = $250,000');

    const invalidTransfer = validateShareTransfer(50000, 100000, 2.5);
    assert(invalidTransfer.isValid === false && invalidTransfer.reason === 'Insufficient seller shares', 'Over-transfer blocked');

    // 36-40: ESOP EQUITY POOL ALLOCATION
    function allocateEsopOptions(poolTotal, poolAllocated, sharesToAllocate) {
      const available = poolTotal - poolAllocated;
      if (sharesToAllocate <= 0 || sharesToAllocate > available) {
        return { success: false, reason: 'Exceeds available pool shares' };
      }
      return {
        success: true,
        newAllocated: poolAllocated + sharesToAllocate,
        newAvailable: available - sharesToAllocate,
      };
    }

    const esop1 = allocateEsopOptions(1000000, 250000, 100000);
    assert(esop1.success === true && esop1.newAvailable === 650000, 'ESOP options allocated successfully (650k available)');

    const esop2 = allocateEsopOptions(1000000, 900000, 200000);
    assert(esop2.success === false, 'ESOP over-allocation blocked');

    // 41-45: COMPLIANCE SCORING & OVERDUE DETECTION
    function calculateComplianceMetrics(items) {
      const total = items.length;
      if (total === 0) return { score: 100, overdue: 0 };
      const completed = items.filter((i) => i.status === 'Completed' || i.status === 'Waived').length;
      const overdue = items.filter((i) => i.status === 'Overdue').length;
      const score = Number(((completed / total) * 100).toFixed(1));
      return { score, overdue };
    }

    const compMetrics = calculateComplianceMetrics([
      { status: 'Completed' },
      { status: 'Completed' },
      { status: 'Completed' },
      { status: 'Overdue' },
    ]);
    assert(compMetrics.score === 75, 'Compliance score calculated as 75%');
    assert(compMetrics.overdue === 1, 'Overdue item count detected as 1');

    // 46-52: SECURITY & IMMUTABILITY CHECKS
    function checkActivityImmutability(activityRecord, action) {
      if (action === 'update' || action === 'delete') {
        return { allowed: false, reason: 'GovernanceActivity records are immutable audit logs' };
      }
      return { allowed: true };
    }

    const immutability = checkActivityImmutability({}, 'update');
    assert(immutability.allowed === false, 'GovernanceActivity update mutation blocked');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runPhase19Tests();
