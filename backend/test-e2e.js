const http = require('http');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('--- Starting Automated E2E Test with Local File DB & Layered Folders ---');

  const dbPath = path.resolve(__dirname, 'db', 'users.json');
  console.log(`Checking local database file at: ${dbPath}`);
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file missing at ${dbPath}`);
  }
  const initialDbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`✓ Initial local database contains ${initialDbData.length} users.`);

  // Helper for HTTP requests
  function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, headers: res.headers, body: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
          }
        });
      });
      req.on('error', reject);
      if (postData) {
        req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
      }
      req.end();
    });
  }

  try {
    // 1. Test Demo Users Endpoint
    console.log('\n[TEST 1] GET /api/auth/demo-users (From controllers/auth.controller.ts)');
    const demoRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/demo-users',
      method: 'GET',
    });
    console.log(`Status: ${demoRes.statusCode}`);
    if (demoRes.statusCode !== 200) throw new Error('Demo users failed');
    console.log(`Found ${demoRes.body.length} demo users:`, demoRes.body.map(u => u.name));

    // 2. Test Invalid Password Login (Bcrypt validation)
    console.log('\n[TEST 2] POST /api/auth/login with invalid password');
    const badLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'alex.rivera@medivault.io', password: 'bad-password-123' }
    );
    console.log(`Status: ${badLogin.statusCode} (Expected 401)`);
    if (badLogin.statusCode !== 401) throw new Error('Expected 401 for bad password');
    console.log('✓ Bcrypt rejected invalid password successfully.');

    // 3. Test Successful Login -> JWE Generation
    console.log('\n[TEST 3] POST /api/auth/login with valid credentials');
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'alex.rivera@medivault.io', password: 'password123' }
    );
    console.log(`Status: ${loginRes.statusCode}`);
    if (loginRes.statusCode !== 200) throw new Error('Valid login failed: ' + JSON.stringify(loginRes.body));

    const token = loginRes.body.accessToken;
    console.log('✓ Token received: ' + token.substring(0, 30) + '...');
    console.log(`Token Type: ${loginRes.body.tokenType}`);
    console.log('Login Response Keys:', Object.keys(loginRes.body));
    if (loginRes.body.user || loginRes.body.medicalRecord) {
      throw new Error('Login response leaked sensitive user / medical data!');
    }
    console.log('✓ Confirmed: Login response contains ONLY the authentication token!');
    
    // Validate JWE RFC 7516 5-part structure
    const segments = token.split('.');
    console.log(`✓ Token segments count: ${segments.length} (Expected 5 for JWE)`);
    if (segments.length !== 5) throw new Error('Token is NOT a 5-part JWE token!');

    // 4. Test Protected Route GET /api/profile using JWE Bearer
    console.log('\n[TEST 4] GET /api/profile with JWE Bearer token (From controllers/profile.controller.ts)');
    const profileRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/profile',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Status: ${profileRes.statusCode}`);
    if (profileRes.statusCode !== 200) throw new Error('Profile fetch failed: ' + JSON.stringify(profileRes.body));

    const patient = profileRes.body.data;
    console.log('✓ Decrypted Patient Profile Details:');
    console.log(`  • Full Name:      ${patient.fullName}`);
    console.log(`  • Avatar URL:     ${patient.avatarUrl}`);
    console.log(`  • Address:        ${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.zipCode}`);
    console.log(`  • Blood Type:     ${patient.medicalRecord.bloodType}`);
    console.log(`  • Allergies:      ${patient.medicalRecord.allergies.join(', ')}`);

    // 5. Test Modifying Medical Record & Verify Disk Persistence
    const uniqueTestAllergy = `TestAllergy_${Date.now()}`;
    console.log(`\n[TEST 5] POST /api/profile/allergies with: "${uniqueTestAllergy}"`);
    const allergyRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/profile/allergies',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      { allergy: uniqueTestAllergy }
    );
    console.log(`Status: ${allergyRes.statusCode}`);
    if (allergyRes.statusCode !== 201) throw new Error('Failed to add allergy');

    // 6. Direct Disk Verification
    console.log('\n[TEST 6] Verifying physical persistence in backend/db/users.json on disk...');
    const updatedDbContent = fs.readFileSync(dbPath, 'utf8');
    if (!updatedDbContent.includes(uniqueTestAllergy)) {
      throw new Error(`Disk persistence verification failed: "${uniqueTestAllergy}" not found in ${dbPath}`);
    }
    console.log(`✓ Confirmed! "${uniqueTestAllergy}" was written directly to ${dbPath} on disk.`);

    console.log('\n========================================================================');
    console.log('   ALL REORGANIZED CONTROLLERS, SERVICES, ROUTES & LOCAL DB VERIFIED!   ');
    console.log('========================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
}

async function waitForServer(maxAttempts = 15, interval = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000/api/auth/demo-users', (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Status: ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      console.log(`Server responded ready on attempt ${i + 1}`);
      return;
    } catch (e) {
      await new Promise((r) => setTimeout(r, interval));
    }
  }
  throw new Error('Server did not become ready in time');
}

async function start() {
  await waitForServer();
  await runTests();
}

start();
