const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

function postJSON(path, payload, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
      },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(dataString);
    req.end();
  });
}

function getJSON(path, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function verifyFixes() {
  console.log('=== VERIFYING ADMIN LOGIN & INVESTMENTS API FIXES ===\n');

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
    // 1. Admin Login with admin@ventriva.com / admin123
    const adminLogin = await postJSON('/api/auth/login', {
      email: 'admin@ventriva.com',
      password: 'admin123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'POST /api/auth/login (admin@ventriva.com / admin123) returned HTTP 200 & JWT token');

    const adminToken = adminLogin.data.token;

    // 2. GET /api/auth/me for Admin
    const me = await getJSON('/api/auth/me', adminToken);
    assert(me.status === 200 && me.data.user?.role === 'admin', `GET /api/auth/me returned HTTP 200 for role: ${me.data.user?.role}`);

    // 3. GET /api/investments/my-investments (Previously returned HTTP 500)
    const myInvestments = await getJSON('/api/investments/my-investments', adminToken);
    assert(myInvestments.status === 200 && Array.isArray(myInvestments.data.data), `GET /api/investments/my-investments returned HTTP 200 (Count: ${myInvestments.data.data?.length})`);

    // 4. GET /api/investments
    const investments = await getJSON('/api/investments', adminToken);
    assert(investments.status === 200 && Array.isArray(investments.data.data), `GET /api/investments returned HTTP 200 (Count: ${investments.data.data?.length})`);

    console.log(`\n========================================`);
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`✗ FAIL: ${err.message}`);
    process.exit(1);
  }
}

verifyFixes();
