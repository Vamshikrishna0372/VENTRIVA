const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (err) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', (err) => reject(err));
  });
}

async function runHealthTests() {
  console.log('=== REAL HTTP HEALTH PROBE VERIFICATION ===\n');

  try {
    const health = await makeRequest('/api/health');
    console.log(`[HTTP 1] GET /api/health -> Status: ${health.status}`);
    console.log(`Payload:`, health.data);

    const ready = await makeRequest('/api/health/ready');
    console.log(`\n[HTTP 2] GET /api/health/ready -> Status: ${ready.status}`);
    console.log(`Payload:`, ready.data);

    if (health.status === 200 && ready.status === 200 && ready.data.data.database === 'ready') {
      console.log('\n✓ LIVE HTTP HEALTH PROBES VERIFIED SUCCESSFULLY!');
      process.exit(0);
    } else {
      console.error('\n✗ HEALTH PROBES FAILED');
      process.exit(1);
    }
  } catch (err) {
    console.error('✗ CONNECTION ERROR:', err.message);
    process.exit(1);
  }
}

runHealthTests();
