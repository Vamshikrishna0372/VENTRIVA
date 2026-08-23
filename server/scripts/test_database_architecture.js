const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

async function testDatabaseArchitecture() {
  console.log('=== VENTRIVA DATABASE ARCHITECTURE CONSOLIDATION TEST SUITE ===\n');

  // 1. Verify Model File Count in server/models
  const modelsDir = path.join(__dirname, '../models');
  const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.js'));
  console.log(`✓ Active Mongoose Model Files: ${modelFiles.length}`);
  assert.strictEqual(modelFiles.length, 50, `Expected 50 model files, but found ${modelFiles.length}`);
  console.log('✓ PASS: Mongoose model file count is exactly 50\n');

  // 2. Verify Obsolete Model Files are completely deleted
  const deletedModels = [
    'ClosingActivity.js',
    'DealActivity.js',
    'FundraisingActivity.js',
    'GovernanceActivity.js',
    'PortfolioActivity.js',
    'PipelineHistory.js',
    'DealMilestone.js',
    'FundraisingMilestone.js',
    'PortfolioMilestone.js',
    'FundraisingNote.js',
    'PortfolioNote.js',
    'FundraisingDocumentLink.js',
    'DocumentVersion.js',
    'DocumentAccessLog.js',
  ];

  for (const file of deletedModels) {
    const filePath = path.join(modelsDir, file);
    assert.strictEqual(fs.existsSync(filePath), false, `Obsolete model file ${file} still exists!`);
  }
  console.log('✓ PASS: All 14 obsolete/consolidated model files are verified deleted\n');

  // 3. Verify ActivityLog schema
  const ActivityLog = require('../models/ActivityLog');
  assert(ActivityLog, 'ActivityLog model failed to load');
  console.log('✓ PASS: ActivityLog unified polymorphic model loads successfully\n');

  // 4. Verify MongoDB Live Database Connection & Readiness Probe
  const res = await axios.get('http://localhost:5000/api/health/ready');
  assert.strictEqual(res.status, 200, 'Health ready check failed');
  assert.strictEqual(res.data.data.database, 'ready', 'Database status is not ready');
  console.log('✓ PASS: HTTP GET /api/health/ready returned HTTP 200 (database: ready)\n');

  console.log('========================================');
  console.log('DATABASE ARCHITECTURE TEST SUITE PASSED');
  console.log('========================================\n');
}

testDatabaseArchitecture().catch((err) => {
  console.error('❌ FAIL: Database Architecture Test Failed:', err);
  process.exit(1);
});
