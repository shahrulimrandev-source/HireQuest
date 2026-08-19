const fs = require('fs');

const pdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCgkJPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqCjw8IC9MZW5ndGggNDYgPj4Kc3RyZWFtCkJUCi9GMSAxOCBUZgoxMCAxMDIgVGQKKENlcnRpZmljYXRlIG9mIEFjaGlldmVtZW50KSBUago2MCA4MCBUZAooUmVhY3QgQ291cnNlKSBUago0MCA2MCBUZAooT2N0b2JlciAyMDIzKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTU3IDAwMDAwIG4gCjAwMDAwMDAyNjcgMDAwMDAgbiAKMDAwMDAwMDM1NiAwMDAwMCBuIAp0cmFpbGVyCjw8CiAgL1NpemUgNgogIC9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0NTIKJSVFT0YK";

fs.writeFileSync('test_cert.pdf', Buffer.from(pdfBase64, 'base64'));

const fetch = require('node-fetch'); // wait, node 18 fetch exists. we don't need node-fetch.

async function run() {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('certificate', fs.createReadStream('test_cert.pdf'));
    formData.append('seekerId', '1');

    const res = await fetch('http://localhost:5000/api/seeker/certificates/upload', {
      method: 'POST',
      body: formData,
      // form-data library might not work with native fetch directly without headers
      // Let's just use the form-data submit method instead
    });
    
    // Actually, just let's use the old http module to make it robust since node fetch FormData is annoying.
  } catch(e) {
    console.error(e);
  }
}
run();
