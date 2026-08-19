fetch('http://localhost:5000/api/jobs').then(r => r.text()).then(console.log).catch(console.error);
