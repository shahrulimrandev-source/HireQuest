async function runTests() {
  const baseUrl = 'http://localhost:5000';
  let passed = 0;
  let failed = 0;

  console.log('--- TESTING AI ENDPOINTS ---');

  // Test 1: AI Match Reason
  try {
    console.log('\nTesting /api/ai/match-reason ...');
    const res = await fetch(`${baseUrl}/api/ai/match-reason`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seekerName: 'Test User',
        seekerSkills: 'React, Node.js',
        seekerBio: 'Frontend dev',
        jobTitle: 'Frontend Engineer',
        jobSkills: 'React, HTML, CSS',
        language: 'ms'
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.reason && data.reason.length > 20) {
        console.log('✅ AI Match Reason API working');
        passed++;
      } else {
        console.log('❌ AI Match Reason API failed: Invalid response format', data);
        failed++;
      }
    } else {
      console.log(`❌ AI Match Reason API failed with status ${res.status}`);
      const text = await res.text();
      console.log('Response:', text);
      failed++;
    }
  } catch (err) {
    console.log('❌ AI Match Reason API error:', err.message);
    failed++;
  }

  // Test 2: Learning Recommendations
  try {
    console.log('\nTesting /api/ai/learning-recommendation ...');
    const res = await fetch(`${baseUrl}/api/ai/learning-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills: 'React, Node',
        targetRole: 'Full Stack Developer',
        language: 'en'
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.recommendations || data.success) {
         console.log('✅ Learning API working');
         passed++;
      } else {
         console.log('❌ Learning API returned unexpected format:', data);
         failed++;
      }
    } else {
      console.log(`❌ Learning API returned ${res.status}`);
      const text = await res.text();
      console.log('Response:', text);
      failed++;
    }
  } catch (err) {
    console.log('❌ Learning API error:', err.message);
    failed++;
  }

  console.log(`\n--- SUMMARY: ${passed} Passed, ${failed} Failed ---`);
}

runTests();
