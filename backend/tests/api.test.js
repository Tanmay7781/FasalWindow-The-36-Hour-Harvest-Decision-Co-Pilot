const http = require('http');
const assert = require('assert');
const app = require('../src/app');

let server;
const PORT = 5099; // Test port

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Running Express Backend Automated Tests ---');
  let passed = 0;
  let failed = 0;

  server = app.listen(PORT);

  try {
    // Test 1: GET /api/health
    const healthRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET'
    });
    assert.strictEqual(healthRes.status, 200, 'Health endpoint must return 200');
    assert.strictEqual(healthRes.body.service, 'fasalwindow-express-backend');
    console.log('✓ PASS: GET /api/health returns 200 with service status');
    passed++;

    // Test 2: GET /api/crops
    const cropsRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/crops',
      method: 'GET'
    });
    assert.strictEqual(cropsRes.status, 200);
    assert.strictEqual(cropsRes.body.success, true);
    assert(cropsRes.body.data.length > 0, 'Crops catalogue should have items');
    console.log('✓ PASS: GET /api/crops returns crops catalogue');
    passed++;

    // Test 3: POST /api/analyze validation - missing crop_name
    const invalidCropRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/analyze',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      crop_name: '',
      mandi_quotes: [{ mandi_name: 'Gwalior', distance_km: 15 }]
    });
    assert.strictEqual(invalidCropRes.status, 400);
    assert.strictEqual(invalidCropRes.body.error, true);
    console.log('✓ PASS: POST /api/analyze rejects empty crop_name with 400');
    passed++;

    // Test 4: POST /api/analyze validation - missing mandi_quotes
    const emptyQuotesRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/analyze',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      crop_name: 'Wheat',
      mandi_quotes: []
    });
    assert.strictEqual(emptyQuotesRes.status, 400);
    assert.strictEqual(emptyQuotesRes.body.error, true);
    console.log('✓ PASS: POST /api/analyze rejects empty mandi_quotes with 400');
    passed++;

    // Test 5: POST /api/overrides validation - missing override reason
    const invalidOverrideRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/overrides',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      analysis_id: 'test-123',
      chosen_mandi: 'Dabra Mandi',
      override_reason: ''
    });
    assert.strictEqual(invalidOverrideRes.status, 400);
    assert.strictEqual(invalidOverrideRes.body.error, true);
    console.log('✓ PASS: POST /api/overrides enforces mandatory override_reason with 400');
    passed++;

    // Test 6: POST /api/overrides success
    const validOverrideRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/overrides',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      analysis_id: 'analysis-uuid-001',
      original_recommended_mandi: 'Gwalior Laxmiganj',
      chosen_mandi: 'Dabra Mandi',
      override_reason: 'Road towards Gwalior has severe waterlogging; Dabra highway is open.',
      actor_id: 'Ramesh (Extension Officer)'
    });
    assert.strictEqual(validOverrideRes.status, 201);
    assert.strictEqual(validOverrideRes.body.success, true);
    assert.strictEqual(validOverrideRes.body.override.chosen_mandi, 'Dabra Mandi');
    console.log('✓ PASS: POST /api/overrides logs human override audit record');
    passed++;

    console.log(`\nAll Backend Tests Completed: ${passed} passed, ${failed} failed.`);
  } catch (err) {
    console.error('Test Failed:', err);
    failed++;
  } finally {
    server.close();
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runTests();
