const Tesseract = require('tesseract.js');
const fs = require('fs');

async function test() {
  try {
    fs.writeFileSync('test.png', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    console.log("Running tesseract...");
    const { data: { text } } = await Tesseract.recognize('test.png', 'eng');
    console.log("Text:", text);
  } catch(e) {
    console.error("Tesseract Error:", e);
  }
}
test();
