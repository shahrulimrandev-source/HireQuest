const fetch = require('node-fetch');

async function check() {
  try {
    const res = await fetch('http://localhost:5000/api/candidates/match/1');
    const data = await res.json();
    console.log(JSON.stringify(data.map(c => ({ id: c.id, certs: c.certificates })), null, 2));
  } catch(e) {
    console.error(e);
  }
}
check();
