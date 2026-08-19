async function runTests() {
  const baseUrl = 'http://localhost:5000';
  let passed = 0;
  let failed = 0;

  console.log('--- TESTING AI ENDPOINTS DEEP ---');

  // Test 1: AI Match Reason
  try {
    console.log('\nTesting /api/ai/match-reason ...');
    const res = await fetch(`${baseUrl}/api/ai/match-reason`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seekerId: 1, // we need a valid seekerId and jobId if it exists in the db, wait, the API requires DB access?
        jobId: 1,
        lang: 'ms'
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('Match Reason API response:', data);
    } else {
      console.log(`❌ AI Match Reason API failed with status ${res.status}`);
      const text = await res.text();
      console.log('Response:', text);
    }
  } catch (err) {
    console.log('❌ AI Match Reason API error:', err.message);
  }

  // Test 2: Learning Recommendations
  try {
    console.log('\nTesting /api/ai/learning-recommendation ...');
    const res = await fetch(`${baseUrl}/api/ai/learning-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seekerId: 1,
        jobId: 1,
        lang: 'en'
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('Learning API response:', data);
    } else {
      console.log(`❌ Learning API returned ${res.status}`);
      const text = await res.text();
      console.log('Response:', text);
    }
  } catch (err) {
    console.log('❌ Learning API error:', err.message);
  }

}

runTests();
