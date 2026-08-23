const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testFounderLogins() {
  await connectDB();
  console.log('--- FORENSIC FOUNDER LOGIN AUDIT ---');

  const founders = await User.find({ role: 'founder' }).select('+password').lean();
  console.log(`Found ${founders.length} founder accounts in DB.\n`);

  // Sample common passwords to test matching
  const candidatePasswords = ['founder123', 'password123', 'krish123', 'admin123', 'Ventriva123!', '12345678'];

  for (const f of founders) {
    console.log(`User: ${f.name} | Email: "${f.email}" | Role: ${f.role} | Active: ${f.isActive} | Verified: ${f.isVerified}`);

    let matchedPassword = null;
    if (f.password) {
      for (const pass of candidatePasswords) {
        const isMatch = await bcrypt.compare(pass, f.password);
        if (isMatch) {
          matchedPassword = pass;
          break;
        }
      }
    }

    if (matchedPassword) {
      console.log(`  -> Valid bcrypt candidate password found: "${matchedPassword}"`);

      // Now test actual HTTP API POST /api/auth/login
      try {
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
          email: f.email,
          password: matchedPassword,
        });

        console.log(`  -> HTTP POST /api/auth/login SUCCESS: Status ${loginRes.status}`);
        console.log(`     Token returned: ${loginRes.data.token ? 'YES' : 'NO'}`);
        console.log(`     User role in payload: ${loginRes.data.user?.role}`);

        // Test GET /api/auth/me
        const meRes = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${loginRes.data.token}` },
        });

        console.log(`  -> HTTP GET /api/auth/me SUCCESS: Role = ${meRes.data.user?.role}`);
      } catch (err) {
        console.error(`  -> HTTP Login FAILED for ${f.email}:`, err.response?.data || err.message);
      }
    } else {
      console.log(`  -> Password hash exists but candidate passwords did not match.`);
    }
    console.log('---');
  }

  // Also test duplicate registration error response for existing founder email
  console.log('\n--- Testing Duplicate Registration Error Response ---');
  try {
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Duplicate Founder Test',
      email: 'founder@ventriva.com',
      password: 'password123',
      role: 'founder',
    });
    console.error('[FAIL] Duplicate registration should have failed but succeeded:', regRes.data);
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.message?.includes('already registered')) {
      console.log('[PASS] Duplicate registration properly rejected (400 Bad Request: "Email address is already registered")');
    } else {
      console.error('[FAIL] Unexpected duplicate registration response:', err.response?.data || err.message);
    }
  }

  await disconnectDB();
}

testFounderLogins().catch(console.error);
