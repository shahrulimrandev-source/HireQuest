const fs = require('fs');
fs.writeFileSync('dummy.png', 'fake image data');

const fetch = require('node-fetch'); // we might not have node-fetch? we can use native fetch in node 18+

async function upload() {
  const formData = new FormData();
  formData.append('certificate', new Blob([fs.readFileSync('dummy.png')], { type: 'image/png' }), 'dummy.png');
  formData.append('seekerId', '1');

  try {
    const res = await fetch('http://localhost:5001/api/seeker/certificates/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log("Response:", data);
  } catch(e) {
    console.error("Fetch error:", e);
  }
}
upload();
