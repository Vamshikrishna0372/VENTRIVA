const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runIntelligenceTests() {
  console.log('====================================================');
  console.log('  VENTRIVA INTELLIGENCE & ACTION CENTER API SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const accounts = [
    { role: 'admin', email: 'admin@ventriva.com', pass: 'admin123' },
    { role: 'founder', email: 'founder@ventriva.com', pass: 'founder123' },
    { role: 'investor', email: 'investor@ventriva.com', pass: 'investor123' },
  ];

  const tokens = {};

  // 1. Authenticate all test roles
  for (const acc of accounts) {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: acc.email,
        password: acc.pass,
      });

      if (res.data && res.data.token) {
        tokens[acc.role] = res.data.token;
        console.log(`[PASS] Logged in as ${acc.role.toUpperCase()} (${acc.email})`);
        passed++;
      } else {
        console.error(`[FAIL] Login returned no token for ${acc.role}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] Auth error for ${acc.role}:`, err.response?.data || err.message);
      failed++;
    }
  }

  // 2. Test Feature 1: Startup Investment Readiness Score (Founder)
  console.log('\n--- Testing Feature 1: Startup Investment Readiness Score ---');
  try {
    // Ensure founder startup exists
    const myStartupsRes = await axios.get(`${API_BASE}/startups/my`, {
      headers: { Authorization: `Bearer ${tokens.founder}` },
    }).catch(() => null);

    if (!myStartupsRes || !myStartupsRes.data?.data) {
      const createRes = await axios.post(
        `${API_BASE}/startups`,
        {
          startupName: 'Ventriva AI Tech',
          tagline: 'Autonomous Venture Capital Platform',
          description: 'Next-gen venture investment engine with automated matching and readiness scoring.',
          foundedYear: 2024,
          sector: 'Enterprise SaaS',
          stage: 'Seed',
          businessModel: 'SaaS',
          fundingRequired: 1500000,
          currency: 'USD',
          isPublished: true,
          profileVisibility: 'Investors Only',
        },
        { headers: { Authorization: `Bearer ${tokens.founder}` } }
      ).catch((e) => {
        console.error('Error creating test startup:', e.response?.data || e.message);
        return null;
      });

      if (createRes?.data?.data) {
        console.log(`       Created test startup profile: "${createRes.data.data.startupName}"`);
      }
    }

    const res = await axios.get(`${API_BASE}/startups/my/readiness`, {
      headers: { Authorization: `Bearer ${tokens.founder}` },
    });

    if (res.status === 200 && res.data?.success && res.data?.data) {
      const readiness = res.data.data;
      console.log(`[PASS] GET /api/startups/my/readiness returned overallScore: ${readiness.overallScore}/100`);
      console.log(`       Categories: ${Object.keys(readiness.categoryScores || {}).length} categories calculated`);
      console.log(`       Completed Items: ${readiness.completedItems.length}`);
      console.log(`       Missing Items: ${readiness.missingItems.length}`);
      console.log(`       Recommended Actions: ${readiness.recommendedActions.length}`);
      passed++;
    } else {
      console.error('[FAIL] Readiness score payload invalid:', res.data);
      failed++;
    }
  } catch (err) {
    console.error('[FAIL] GET /api/startups/my/readiness failed:', err.response?.data || err.message);
    failed++;
  }

  // 3. Test Feature 2: Investor ↔ Startup Matching Engine (Investor)
  console.log('\n--- Testing Feature 2: Investor ↔ Startup Matching Engine ---');
  try {
    const res = await axios.get(`${API_BASE}/investors/matches`, {
      headers: { Authorization: `Bearer ${tokens.investor}` },
    });

    if (res.status === 200 && res.data?.success && Array.isArray(res.data?.matches)) {
      console.log(`[PASS] GET /api/investors/matches returned ${res.data.matches.length} matching startup(s)`);
      if (res.data.matches.length > 0) {
        const top = res.data.matches[0];
        console.log(`       Top Match: ${top.startup.startupName} (${top.matchScore}% Match Score)`);
        console.log(`       Reason: "${top.recommendationReason}"`);
      }
      passed++;
    } else {
      console.error('[FAIL] Investor matches payload invalid:', res.data);
      failed++;
    }
  } catch (err) {
    console.error('[FAIL] GET /api/investors/matches failed:', err.response?.data || err.message);
    failed++;
  }

  // 4. Test Feature 3: Role Action Center (All 3 Roles)
  console.log('\n--- Testing Feature 3: Role Action Center ---');
  for (const acc of accounts) {
    try {
      const res = await axios.get(`${API_BASE}/actions/my`, {
        headers: { Authorization: `Bearer ${tokens[acc.role]}` },
      });

      if (res.status === 200 && res.data?.success && Array.isArray(res.data?.actions)) {
        console.log(`[PASS] GET /api/actions/my for ${acc.role.toUpperCase()}: ${res.data.totalActions} action(s) returned`);
        passed++;
      } else {
        console.error(`[FAIL] Action center payload invalid for ${acc.role}:`, res.data);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] GET /api/actions/my failed for ${acc.role}:`, err.response?.data || err.message);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`  SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runIntelligenceTests();
