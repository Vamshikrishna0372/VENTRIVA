const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const axios = require('axios');
const mongoose = require('mongoose');
const assert = require('assert');

const API_BASE = 'http://localhost:5000/api';

async function runControlledWorkflowTest() {
  console.log('====================================================');
  console.log(' CONTROLLED REAL DATA WORKFLOW TEST & CLEANUP SUITE ');
  console.log('====================================================\n');

  // Ensure pristine starting state: wipe all business data
  await mongoose.connect(process.env.MONGODB_URI);
  const dbInit = mongoose.connection.db;
  const initCols = await dbInit.listCollections().toArray();
  for (const col of initCols) {
    if (col.name !== 'users') {
      await dbInit.collection(col.name).deleteMany({});
    }
  }
  await mongoose.connection.close();

  // 1. Authenticate clean users
  const adminLogin = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
  const founderLogin = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
  const investorLogin = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });

  const adminToken = adminLogin.data.token;
  const founderToken = founderLogin.data.token;
  const investorToken = investorLogin.data.token;

  console.log('✓ PASS: All 3 clean development accounts authenticated successfully');

  // Ensure clean start: delete existing founder startup if any
  const existingStartupRes = await axios.get(`${API_BASE}/startups/my`, {
    headers: { Authorization: `Bearer ${founderToken}` },
  }).catch(() => null);

  if (existingStartupRes?.data?.startup?._id) {
    await axios.delete(`${API_BASE}/startups/my/${existingStartupRes.data.startup._id}`, {
      headers: { Authorization: `Bearer ${founderToken}` },
    }).catch(() => null);
  }

  // 2. Founder creates startup
  const startupRes = await axios.post(
    `${API_BASE}/startups`,
    {
      startupName: 'Nexus Quantum Bio',
      tagline: 'Quantum-accelerated drug discovery',
      description: 'Pioneering AI-driven molecular synthesis for oncology therapeutics.',
      foundedYear: 2024,
      sector: 'HealthTech',
      stage: 'Seed',
      businessModel: 'B2B',
      fundingRequired: 2500000,
      currency: 'USD',
      isPublished: true,
      profileVisibility: 'Investors Only',
    },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );

  const startup = startupRes.data.startup || startupRes.data.data;
  assert(startup, 'Failed to extract created startup');

  // Founder publishes startup
  await axios.put(
    `${API_BASE}/startups/my/${startup._id}`,
    { isPublished: true, profileVisibility: 'Investors Only' },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );

  console.log(`✓ PASS: Founder created & published startup "${startup.startupName}" (ID: ${startup._id})`);

  // 3. Investor discovers startup
  const discoverRes = await axios.get(`${API_BASE}/startups/discover`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  const discoveredStartups = discoverRes.data.data?.startups || discoverRes.data.startups || [];
  assert(discoveredStartups.some((s) => s._id === startup._id), 'Investor failed to discover created startup');
  console.log('✓ PASS: Investor discovered startup in live discovery portal');

  // 4. Investor shortlists startup
  const shortlistRes = await axios.post(
    `${API_BASE}/shortlists`,
    { startupId: startup._id, notes: 'Promising healthtech venture' },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  console.log('✓ PASS: Investor added startup to shortlist');

  // 5. Investor expresses interest
  const interestRes = await axios.post(
    `${API_BASE}/interests`,
    {
      startupId: startup._id,
      interestLevel: 'High',
      proposedTicketSize: 500000,
      message: 'Extremely interested in leading your Seed round.',
    },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  console.log('✓ PASS: Investor expressed interest ($500,000 proposed ticket)');

  // 6. Investor creates evaluation
  const evalRes = await axios.post(
    `${API_BASE}/evaluations`,
    {
      startupId: startup._id,
      scores: {
        team: 9,
        market: 9,
        product: 8,
        traction: 8,
        businessModel: 8,
        competitiveAdvantage: 9,
        financials: 7,
        fundraising: 8,
      },
      strengths: ['Experienced founders', 'Large TAM'],
      risks: ['Early revenue stage'],
      privateNotes: 'Strong quantum team with exceptional market opportunity.',
      investmentDecision: 'Interested',
    },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  const evaluationObj = evalRes.data.evaluation || evalRes.data.data;
  console.log(`✓ PASS: Investor completed evaluation (Overall Score: ${evaluationObj?.overallScore || 'N/A'}/100)`);

  // 7. Investor creates pipeline entry
  const pipelineRes = await axios.post(
    `${API_BASE}/pipelines`,
    { startupId: startup._id, stage: 'Due Diligence', priority: 'High', expectedInvestment: 500000 },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  console.log('✓ PASS: Investor created pipeline entry (Stage: Due Diligence)');

  // 8. Verify persistence in MongoDB Atlas
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const startupsInDb = await db.collection('startups').countDocuments();
  const shortlistsInDb = await db.collection('shortlists').countDocuments();
  const interestsInDb = await db.collection('investorinterests').countDocuments();
  const evalsInDb = await db.collection('evaluations').countDocuments();
  const pipelinesInDb = await db.collection('pipelineentries').countDocuments();
  const activityInDb = await db.collection('activitylogs').countDocuments();

  console.log('\n--- LIVE WORKFLOW PERSISTENCE IN MONGODB ATLAS ---');
  console.log(`  - Startups: ${startupsInDb}`);
  console.log(`  - Shortlists: ${shortlistsInDb}`);
  console.log(`  - Investor Interests: ${interestsInDb}`);
  console.log(`  - Evaluations: ${evalsInDb}`);
  console.log(`  - Pipeline Entries: ${pipelinesInDb}`);
  console.log(`  - Activity Logs: ${activityInDb}`);

  assert.strictEqual(startupsInDb, 1);
  assert.strictEqual(shortlistsInDb, 1);
  assert.strictEqual(interestsInDb, 1);
  assert.strictEqual(evalsInDb, 1);
  assert.strictEqual(pipelinesInDb, 1);

  console.log('✓ PASS: End-to-end workflow persistence confirmed in MongoDB Atlas\n');

  // 9. CLEANUP TEMPORARY WORKFLOW DATA
  console.log('--- CLEANING UP TEMPORARY WORKFLOW TEST DATA ---');
  const collectionsToClear = [
    'startups',
    'shortlists',
    'investorinterests',
    'evaluations',
    'pipelineentries',
    'activitylogs',
    'notifications',
  ];

  for (const colName of collectionsToClear) {
    await db.collection(colName).deleteMany({});
  }

  // Verify DB state after cleanup
  const collectionsAfter = await db.listCollections().toArray();
  let totalDocsAfter = 0;
  for (const col of collectionsAfter) {
    const c = await db.collection(col.name).countDocuments();
    totalDocsAfter += c;
  }

  const userCount = await db.collection('users').countDocuments();
  console.log(`Post-Cleanup Total Documents in MongoDB Atlas: ${totalDocsAfter}`);
  console.log(`Post-Cleanup User Count: ${userCount}`);

  assert.strictEqual(userCount, 3, 'User count must be exactly 3');
  assert.strictEqual(totalDocsAfter, 3, 'Total document count must be exactly 3');

  console.log('\n✨ CONTROLLED WORKFLOW TESTED & TEMPORARY DATA CLEANLY PURGED! ✨');
  console.log('====================================================\n');
  await mongoose.connection.close();
}

runControlledWorkflowTest().catch((err) => {
  console.error('❌ FAIL: Controlled Workflow Test Failed:', err);
  process.exit(1);
});
