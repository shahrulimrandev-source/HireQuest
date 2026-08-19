import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testFlash() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello, say hi");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Failed model gemini-2.5-flash:", err.message);
  }
}
testFlash();
