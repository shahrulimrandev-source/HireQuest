import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from './db.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const seekerId = 1;
    const jobId = 1;
    
    const [seekerRows] = await pool.query('SELECT name, bio, skills FROM users WHERE id = ?', [seekerId]);
    const [jobRows] = await pool.query('SELECT title, description, skills, requirements FROM jobs WHERE id = ?', [jobId]);
    
    const seeker = seekerRows[0];
    const job = jobRows[0];
    
    const prompt = `Anda adalah seorang pakar HR dan pengurus pencarian bakat. 
Tugasan anda adalah untuk memberikan ulasan ringkas (maksimum 3 ayat pendek) menerangkan mengapa pemohon ini sesuai untuk pekerjaan ini.
Gunakan Bahasa Melayu yang mesra, profesional, dan membina. Fokus pada kemahiran pemohon yang sepadan dengan keperluan kerja.
Penting: Bersikap lebih terbuka dan bertimbang rasa dengan kesalahan ejaan (contoh: 'Phyton' dan 'Python') serta huruf besar/kecil (contoh: 'reactjs' dan 'React JS'). Anggap kemahiran tersebut sebagai sama dan sepadan.

Maklumat Pekerjaan:
Tajuk: ${job.title}
Deskripsi: ${job.description}
Kemahiran Diperlukan: ${job.skills}

Maklumat Pemohon:
Nama: ${seeker.name}
Bio: ${seeker.bio || 'Tiada bio'}
Kemahiran: ${seeker.skills || 'Tiada kemahiran spesifik'}

Sila hasilkan ulasan AI anda sekarang.`;

    console.log("PROMPT:", prompt);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    console.log("RESPONSE:", result.response.text());
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    pool.end();
  }
}
run();
