const fetch = require('node-fetch');

async function test() {
  const response = await fetch('http://localhost:5000/api/applications/company/1');
  const data = await response.json();
  console.log(data);
}

test();
