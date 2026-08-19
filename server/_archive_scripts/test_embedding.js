import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testEmbedding() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent("Hello world");
    console.log("Success:", result.embedding.values.slice(0, 5));
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
testEmbedding();
