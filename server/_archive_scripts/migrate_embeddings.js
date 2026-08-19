import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from './db.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text) {
  try {
    if (!text || text.trim() === '') return null;
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent(text);
    return JSON.stringify(result.embedding.values);
  } catch (err) {
    console.error('Embedding generation error:', err);
    return null;
  }
}

async function migrate() {
  console.log('Migrating existing jobs and users to have embeddings...');
  
  // Jobs
  const [jobs] = await pool.query('SELECT id, title, description, skills FROM jobs WHERE embedding IS NULL');
  for (const job of jobs) {
    const text = `${job.title} ${job.description} ${job.skills}`;
    console.log(`Generating embedding for job: ${job.title}`);
    const embedding = await generateEmbedding(text);
    if (embedding) {
      await pool.query('UPDATE jobs SET embedding = ? WHERE id = ?', [embedding, job.id]);
    }
  }

  // Users
  const [users] = await pool.query('SELECT id, name, bio, skills FROM users WHERE role = "seeker" AND embedding IS NULL');
  for (const user of users) {
    const text = `${user.bio || ''} ${user.skills || ''}`;
    console.log(`Generating embedding for user: ${user.name}`);
    const embedding = await generateEmbedding(text);
    if (embedding) {
      await pool.query('UPDATE users SET embedding = ? WHERE id = ?', [embedding, user.id]);
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate();
