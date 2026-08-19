import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Tesseract from 'tesseract.js';
import pool from './db.js';

import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploads directory
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }
  return matrix[b.length][a.length];
}

function calculateMatchScore(seekerSkills, jobSkills, seekerEmbeddingStr, jobEmbeddingStr) {
  let aiScore = 0;
  // Try AI matching first
  if (seekerEmbeddingStr && jobEmbeddingStr) {
    try {
      const vecA = JSON.parse(seekerEmbeddingStr);
      const vecB = JSON.parse(jobEmbeddingStr);
      if (vecA.length === vecB.length && vecA.length > 0) {
        let dotProduct = 0, normA = 0, normB = 0;
        for (let i = 0; i < vecA.length; i++) {
          dotProduct += vecA[i] * vecB[i];
          normA += vecA[i] * vecA[i];
          normB += vecB[i] * vecB[i];
        }
        if (normA > 0 && normB > 0) {
          const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
          // Scale so that 0.65 is 0% and 0.85 is 80%
          let score = (similarity - 0.65) * 400;
          aiScore = Math.max(0, Math.min(100, Math.round(score)));
        }
      }
    } catch(e) {
      console.error('Embedding match error', e);
    }
  }

  // Calculate keyword matching score
  let keywordScore = 0;
  if (seekerSkills && jobSkills) {
    const sSkills = seekerSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const jSkills = jobSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    
    if (sSkills.length > 0 && jSkills.length > 0) {
      // Find how many job skills are fulfilled by the seeker
      let fulfilledJobSkills = 0;
      
      for (const j of jSkills) {
        // A job skill is fulfilled if ANY seeker skill matches it closely
        if (sSkills.some(s => {
          const sClean = s.replace(/\s+/g, '');
          const jClean = j.replace(/\s+/g, '');
          
          if (sClean === jClean || sClean.includes(jClean) || jClean.includes(sClean)) return true;
          
          const distance = levenshteinDistance(sClean, jClean);
          if (jClean.length > 4 && distance <= 2) return true;
          if (jClean.length <= 4 && distance <= 1) return true;
          
          return false;
        })) {
          fulfilledJobSkills++;
        }
      }
      
      keywordScore = Math.round((fulfilledJobSkills / jSkills.length) * 100);
      keywordScore = Math.min(100, keywordScore);
      console.log(`Match calculation -> Job Skills: ${jSkills.length}, Fulfilled: ${fulfilledJobSkills}, Keyword Score: ${keywordScore}`);
      console.log(`Seeker Skills: `, sSkills);
      console.log(`Job Skills: `, jSkills);
    }
  }

  console.log(`Final Match -> AI: ${aiScore}, Keyword: ${keywordScore}, Max: ${Math.max(aiScore, keywordScore)}`);
  // Return the best of both worlds (AI semantic match vs Exact keyword match)
  return Math.max(aiScore, keywordScore);
}

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (rows.length > 0) {
      const user = rows[0];
      
      if (role && user.role !== role) {
        const expectedRole = user.role === 'seeker' ? 'Job Seeker' : 'Employer';
        return res.status(401).json({ success: false, message: `This account is registered as an ${expectedRole}. Please switch the login type.` });
      }

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, skills: user.skills, bio: user.bio, profile_picture: user.profile_picture, resume: user.resume, certificate: user.certificate, banner: user.banner } });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role, name, skills } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const embedding = await generateEmbedding(`${skills || ''}`);
    const [result] = await pool.query(
      'INSERT INTO users (email, password, role, name, skills, embedding) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, role, name, skills || '', embedding]
    );
    res.json({ success: true, user: { id: result.insertId, name, email, role, skills: skills || '', bio: '', profile_picture: null, resume: null, certificate: null } });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// Feed: Get mixed feed of jobs and posts
app.get('/api/feed', async (req, res) => {
  const { seekerId } = req.query;
  try {
    let seekerSkills = '';
    let seekerEmbeddingStr = null;
    if (seekerId) {
      const [uRows] = await pool.query('SELECT skills, embedding FROM users WHERE id = ?', [seekerId]);
      if (uRows.length > 0) {
        seekerSkills = uRows[0].skills || '';
        seekerEmbeddingStr = uRows[0].embedding;
      }
    }

    let jobQuery = `
      SELECT jobs.*, users.name as companyName, users.profile_picture as companyLogo, users.banner as companyBanner, users.bio as companyBio 
      FROM jobs 
      JOIN users ON jobs.company_id = users.id
      WHERE users.role = 'company'
    `;
    let jobQueryParams = [];
    if (seekerId) {
      jobQuery += ` AND jobs.id NOT IN (SELECT job_id FROM applications WHERE seeker_id = ?)`;
      jobQueryParams.push(seekerId);
    }
    const [jobRows] = await pool.query(jobQuery, jobQueryParams);
    
    let jobsWithScore = jobRows.map(job => ({
      ...job,
      item_type: 'job',
      matchScore: calculateMatchScore(seekerSkills, job.skills, seekerEmbeddingStr, job.embedding)
    }));
    jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    // Fetch company posts
    let postQuery = `
      SELECT company_posts.*, users.name as companyName, users.profile_picture as companyLogo 
      FROM company_posts
      JOIN users ON company_posts.company_id = users.id
      ORDER BY company_posts.id DESC
      LIMIT 20
    `;
    const [postRows] = await pool.query(postQuery);
    
    let posts = postRows.map(post => ({
      ...post,
      item_type: 'post',
      // Randomize match score slightly below top matches so they appear interspersed
      matchScore: 85 + Math.random() * 10 
    }));

    // Combine and sort
    const mixedFeed = [...jobsWithScore, ...posts];
    mixedFeed.sort((a, b) => b.matchScore - a.matchScore);

    res.json(mixedFeed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Company Posts: Create a post
app.post('/api/company-posts', upload.single('media'), async (req, res) => {
  const { company_id, caption, media_type, background_style, text_position } = req.body;
  const media_url = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO company_posts (company_id, caption, media_url, media_type, background_style, text_position) VALUES (?, ?, ?, ?, ?, ?)',
      [company_id, caption, media_url, media_type || 'text', background_style || 'bg-white', text_position || 'center']
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Company Posts: Get company's posts
app.get('/api/company-posts/company/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM company_posts WHERE company_id = ? ORDER BY id DESC', [companyId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Company Posts: Delete post
app.delete('/api/company-posts/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM company_posts WHERE id = ?', [req.params.id]);
    if (result.affectedRows > 0) res.json({ success: true });
    else res.status(404).json({ success: false, message: 'Post not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Users: Get user
app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, skills, bio, profile_picture, resume, certificate, banner, phone_number, website_link, linkedin_link FROM users WHERE id = ?', [req.params.id]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// OCR Keyword Extraction Helpers
const SKILL_DICTIONARY = [
  'Java', 'Python', 'React', 'Node.js', 'JavaScript', 'TypeScript', 'SQL', 
  'AWS', 'Docker', 'Kubernetes', 'C++', 'C#', 'Ruby', 'PHP', 'HTML', 'CSS', 
  'Vue', 'Angular', 'Swift', 'Kotlin', 'Go', 'Rust', 'MongoDB', 'PostgreSQL', 
  'MySQL', 'Redis', 'GraphQL', 'Machine Learning', 'Data Science', 
  'Agile', 'Scrum', 'Leadership', 'Project Management', 'Git', 'Linux', 'Figma'
];

async function extractTextFromFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) return '';
    
    const ext = path.extname(fullPath).toLowerCase();
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(fullPath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const { data: { text } } = await Tesseract.recognize(fullPath, 'eng');
      return text;
    }
  } catch (err) {
    console.error('OCR Extraction Error:', err);
  }
  return '';
}

function extractSkills(text) {
  if (!text) return [];
  const foundSkills = [];
  const lowerText = text.toLowerCase();
  
  for (const skill of SKILL_DICTIONARY) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.push(skill);
    }
  }
  return foundSkills;
}

// Users: Update profile
app.put('/api/users/:id', async (req, res) => {
  const { name, email, skills, bio, education_level, phone_number, website_link, linkedin_link, location } = req.body;
  try {
    const embedding = await generateEmbedding(`${bio || ''} ${skills || ''} ${education_level || ''}`);
    await pool.query('UPDATE users SET name = ?, email = ?, skills = ?, bio = ?, education_level = ?, phone_number = ?, website_link = ?, linkedin_link = ?, location = ?, embedding = ? WHERE id = ?', [name, email, skills, bio, education_level || null, phone_number || null, website_link || null, linkedin_link || null, location || null, embedding, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Users: Upload files (profile_picture, resume, certificate, banner)
app.post('/api/users/:id/uploads', upload.fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'certificate', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  try {
    const files = req.files || {};
    let updates = [];
    let values = [];

    if (files.profile_picture && files.profile_picture[0].size > 0) {
      updates.push('profile_picture = ?');
      values.push(`/uploads/${files.profile_picture[0].filename}`);
    }
    if (files.resume && files.resume[0].size > 0) {
      updates.push('resume = ?');
      values.push(`/uploads/${files.resume[0].filename}`);
    }
    if (files.certificate && files.certificate[0].size > 0) {
      updates.push('certificate = ?');
      values.push(`/uploads/${files.certificate[0].filename}`);
    }
    if (files.banner && files.banner[0].size > 0) {
      updates.push('banner = ?');
      values.push(`/uploads/${files.banner[0].filename}`);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // OCR Skill Extraction Logic
    let newFoundSkills = [];
    let extractedBio = null;
    let extractedSkills = [];
    if ((files.resume && files.resume[0].size > 0) || (files.certificate && files.certificate[0].size > 0)) {
      const filesToParse = [];
      if (files.resume && files.resume[0].size > 0) filesToParse.push(path.join(process.cwd(), 'uploads', files.resume[0].filename));
      if (files.certificate && files.certificate[0].size > 0) filesToParse.push(path.join(process.cwd(), 'uploads', files.certificate[0].filename));
      
      let allText = '';
      for (const filePath of filesToParse) {
        const text = await extractTextFromFile(filePath);
        allText += ' ' + text;
      }

      if (allText.trim().length > 0) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
          });
          
          const prompt = `You are an expert HR assistant. Analyze the following resume/certificate text. Extract a concise professional summary/bio, and an array of all technical and soft skills mentioned. If it is in Malay, keep the extracted bio in Malay, but translate the skills to English standard terms (e.g. "Pengurusan Projek" -> "Project Management").
  Return ONLY a valid JSON object with this exact schema:
  {
    "bio": "Extracted professional summary here (or null if none found)",
    "skills": ["Skill 1", "Skill 2", "Skill 3"]
  }

  Text to analyze:
  ${allText.substring(0, 15000)}`;

          const result = await model.generateContent(prompt);
          let responseText = result.response.text();
          
          // Robust JSON extraction
          const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            responseText = jsonMatch[1];
          } else {
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          }

          const parsed = JSON.parse(responseText);
          
          if (parsed.bio && String(parsed.bio).length > 20) extractedBio = String(parsed.bio);
          if (Array.isArray(parsed.skills)) extractedSkills = parsed.skills;
          console.log("AI Parsed Resume:", { extractedBio, extractedSkills });
        } catch (aiErr) {
          console.error('Gemini extraction error:', aiErr);
          extractedSkills = extractSkills(allText);
        }
      }

      if (extractedSkills.length > 0 || extractedBio) {
        // Fetch current user data
        const [uRows] = await pool.query('SELECT skills, bio, education_level, location FROM users WHERE id = ?', [id]);
        if (uRows.length > 0) {
          let updatedSkillsStr = uRows[0].skills || '';
          let updatedBio = uRows[0].bio || '';
          let changed = false;

          // Process Skills
          if (extractedSkills.length > 0) {
            const currentSkillsList = updatedSkillsStr.split(',').map(s => s.trim()).filter(Boolean);
            
            for (const skill of extractedSkills) {
              if (!currentSkillsList.some(existing => existing.toLowerCase() === skill.toLowerCase())) {
                currentSkillsList.push(skill);
                newFoundSkills.push(skill);
              }
            }
            
            if (newFoundSkills.length > 0) {
              updatedSkillsStr = currentSkillsList.join(', ');
              changed = true;
            }
          }

          // Process Bio
          if (extractedBio) {
            updatedBio = extractedBio;
            changed = true;
          }

          if (changed) {
            const newEmbedding = await generateEmbedding(`${updatedBio} ${updatedSkillsStr} ${uRows[0].education_level || ''}`);
            await pool.query('UPDATE users SET skills = ?, bio = ?, embedding = ? WHERE id = ?', [updatedSkillsStr, updatedBio, newEmbedding, id]);
          }
        }
      }
    }
    
    // Fetch updated user
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    
    // Regenerate embedding if skills or bio were updated by OCR
    if (extractedSkills.length > 0 || extractedBio) {
      const embedding = await generateEmbedding(`${rows[0].bio || ''} ${rows[0].skills || ''}`);
      if (embedding) {
        await pool.query('UPDATE users SET embedding = ? WHERE id = ?', [embedding, id]);
      }
    }
    
    // Fetch one final time to return clean data
    const [finalRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json({ success: true, user: finalRows[0], extractedSkills: newFoundSkills, extractedBio: extractedBio });
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Seeker: Upload and Scan Certificate
app.post('/api/seeker/certificates/upload', upload.single('certificate'), async (req, res) => {
  const { seekerId } = req.body;
  if (!req.file || !seekerId) {
    return res.status(400).json({ success: false, message: 'File and seekerId are required' });
  }

  try {
    const fileUrl = '/uploads/' + req.file.filename;
    const filePath = req.file.path;
    let extractedText = '';

    // Extract text based on file type
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype.startsWith('image/')) {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      extractedText = text;
    }

    // Call Gemini to parse details
    let title = 'Unknown Certificate';
    let issuer = 'Unknown Issuer';
    let issue_date = 'Unknown Date';
    let skills_extracted = '';

    if (extractedText && extractedText.trim().length > 0) {
      const prompt = `
        You are an AI assistant parsing certificate text. 
        Extract the following information from this certificate text:
        - Certificate Title
        - Issuing Organization
        - Date of Issue
        - Any specific skills or topics mentioned (comma separated)
        
        Respond ONLY with a valid JSON object in this exact format:
        {
          "title": "Certificate Title",
          "issuer": "Issuing Organization",
          "date": "Issue Date",
          "skills": "Skill 1, Skill 2"
        }
        
        If a field is not found, leave it as an empty string.
        
        Certificate Text:
        ${extractedText.substring(0, 3000)}
      `;
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      
      try {
        const parsed = JSON.parse(responseText);
        title = parsed.title || title;
        issuer = parsed.issuer || issuer;
        issue_date = parsed.date || issue_date;
        let extracted = parsed.skills || skills_extracted;
        if (Array.isArray(extracted)) {
            extracted = extracted.join(', ');
        }
        skills_extracted = typeof extracted === 'string' ? extracted : JSON.stringify(extracted);
      } catch (e) {
        console.error("Failed to parse Gemini JSON output:", responseText);
      }
    }

    // Save to database
    const [result] = await pool.query(
      'INSERT INTO seeker_certificates (seeker_id, file_url, title, issuer, issue_date, skills_extracted) VALUES (?, ?, ?, ?, ?, ?)',
      [seekerId, fileUrl, title, issuer, issue_date, skills_extracted]
    );

    res.json({
      success: true,
      certificate: {
        id: result.insertId,
        seeker_id: seekerId,
        file_url: fileUrl,
        title,
        issuer,
        issue_date,
        skills_extracted
      }
    });

  } catch (error) {
    console.error('Certificate processing error:', error);
    res.status(500).json({ success: false, message: 'Error processing certificate: ' + error.message });
  }
});

// Seeker: Get Certificates
app.get('/api/seeker/certificates/:seekerId', async (req, res) => {
  const { seekerId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM seeker_certificates WHERE seeker_id = ? ORDER BY created_at DESC', [seekerId]);
    res.json({ success: true, certificates: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Seeker: Delete Certificate
app.delete('/api/seeker/certificates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM seeker_certificates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Users: Remove uploaded file
app.delete('/api/users/:id/uploads/:fileType', async (req, res) => {
  const { id, fileType } = req.params;
  const validTypes = ['profile_picture', 'resume', 'certificate', 'banner'];
  
  if (!validTypes.includes(fileType)) {
    return res.status(400).json({ success: false, message: 'Invalid file type' });
  }

  try {
    await pool.query(`UPDATE users SET ${fileType} = NULL WHERE id = ?`, [id]);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('File removal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Users: Delete account
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Delete applications referencing this user (to satisfy foreign key constraints if any)
    await pool.query('DELETE FROM applications WHERE seeker_id = ?', [id]);
    // Delete the user
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handling middleware to catch Multer errors
app.use((err, req, res, next) => {
  console.error('Express error caught:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
  }
  res.status(500).json({ success: false, message: 'Server error' });
});

// Jobs: Get all jobs (for seekers) with match score
app.get('/api/jobs', async (req, res) => {
  const { seekerId } = req.query;
  try {
    let seekerSkills = '';
    let seekerEmbeddingStr = null;
    if (seekerId) {
      const [uRows] = await pool.query('SELECT skills, embedding FROM users WHERE id = ?', [seekerId]);
      if (uRows.length > 0) {
        seekerSkills = uRows[0].skills || '';
        seekerEmbeddingStr = uRows[0].embedding;
      }
    }

    let query = `
      SELECT jobs.*, users.name as companyName, users.profile_picture as companyLogo, users.banner as companyBanner, users.bio as companyBio 
      FROM jobs 
      JOIN users ON jobs.company_id = users.id
      WHERE users.role = 'company'
    `;
    let queryParams = [];
    if (seekerId) {
      query += ` AND jobs.id NOT IN (SELECT job_id FROM applications WHERE seeker_id = ?)`;
      queryParams.push(seekerId);
    }

    const [rows] = await pool.query(query, queryParams);
    
    // Calculate match score
    const jobsWithScore = rows.map(job => ({
      ...job,
      item_type: 'job',
      matchScore: calculateMatchScore(seekerSkills, job.skills, seekerEmbeddingStr, job.embedding)
    }));

    // Sort by match score descending
    jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    res.json(jobsWithScore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Jobs: AI-powered semantic search
app.post('/api/jobs/search', async (req, res) => {
  const { query, seekerId } = req.body;
  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Generate AI embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    let sqlQuery = `
      SELECT jobs.*, users.name as companyName, users.profile_picture as companyLogo, users.banner as companyBanner, users.bio as companyBio 
      FROM jobs 
      JOIN users ON jobs.company_id = users.id
      WHERE users.role = 'company'
    `;
    let queryParams = [];
    if (seekerId) {
      sqlQuery += ` AND jobs.id NOT IN (SELECT job_id FROM applications WHERE seeker_id = ?)`;
      queryParams.push(seekerId);
    }

    const [rows] = await pool.query(sqlQuery, queryParams);
    
    // Calculate match score using the search query as "skills" and its embedding
    const searchResults = rows.map(job => {
      // Calculate semantic similarity + keyword match
      const score = calculateMatchScore(query, job.skills + ' ' + job.title, JSON.stringify(queryEmbedding), job.embedding);
      return {
        ...job,
        matchScore: score,
        searchRelevance: score
      };
    });

    // Filter out completely irrelevant jobs (e.g. score < 10) and sort by relevance
    const filteredResults = searchResults
      .filter(job => job.searchRelevance > 10)
      .sort((a, b) => b.searchRelevance - a.searchRelevance);

    res.json(filteredResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Companies: Get public company profile
app.get('/api/companies/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, name, bio, profile_picture, banner, email, phone_number, website_link, linkedin_link, location FROM users WHERE id = ? AND role = "company"',
      [companyId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, company: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Candidates: Get recommended candidates for a company
app.get('/api/candidates/match/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    // 1. Get all jobs for this company
    const [jobs] = await pool.query('SELECT id, title, skills, embedding FROM jobs WHERE company_id = ?', [companyId]);
    
    // 2. Get all seekers
    const [seekers] = await pool.query('SELECT id, name, email, phone_number, linkedin_link, skills, embedding, bio, education_level, profile_picture, banner, resume, certificate FROM users WHERE role = "seeker"');
    const [allCertificates] = await pool.query('SELECT * FROM seeker_certificates');

    if (jobs.length === 0) {
      // If company has no jobs, just return all seekers with 0 score
      const candidates = seekers.map(seeker => ({
        ...seeker,
        certificates: allCertificates.filter(c => c.seeker_id === seeker.id),
        matchScore: 0,
        matchedJobTitle: 'General Profile',
        matchedJobId: null
      }));
      return res.json(candidates);
    }

    // 3. For each seeker, calculate the match score for ALL company jobs
    const candidates = [];
    for (const seeker of seekers) {
      for (const job of jobs) {
        const score = calculateMatchScore(seeker.skills, job.skills, seeker.embedding, job.embedding);
        if (score >= 0) {
          candidates.push({
            ...seeker,
            certificates: allCertificates.filter(c => c.seeker_id === seeker.id),
            matchScore: score,
            matchedJobTitle: job.title,
            matchedJobId: job.id
          });
        }
      }
    }

    // 4. Sort by best match score
    candidates.sort((a, b) => b.matchScore - a.matchScore);

    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Jobs: Get jobs by company
app.get('/api/jobs/company/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE company_id = ?', [companyId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Jobs: Create a new job
app.post('/api/jobs', async (req, res) => {
  const { company_id, title, department, location, type, salary, description, requirements, skills } = req.body;
  try {
    const embedding = await generateEmbedding(`${title} ${description} ${skills}`);
    const [result] = await pool.query(
      'INSERT INTO jobs (company_id, title, department, location, type, salary, description, requirements, skills, embedding) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [company_id, title, department, location, type, salary, description, requirements, skills, embedding]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Jobs: Get company's jobs
app.get('/api/jobs/company/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE company_id = ? ORDER BY id DESC', [companyId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Jobs: Update a job
app.put('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const { title, department, location, type, salary, description, requirements, skills } = req.body;
  try {
    const embedding = await generateEmbedding(`${title} ${description} ${skills}`);
    await pool.query(
      'UPDATE jobs SET title=?, department=?, location=?, type=?, salary=?, description=?, requirements=?, skills=?, embedding=? WHERE id=?',
      [title, department, location, type, salary, description, requirements, skills, embedding, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Jobs: Delete a job
app.delete('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Delete applications referencing this job
    await pool.query('DELETE FROM applications WHERE job_id = ?', [id]);
    // Delete the job
    await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Applications: Apply for a job or Invite a candidate
app.post('/api/applications', async (req, res) => {
  const { job_id, seeker_id, status, message } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO applications (job_id, seeker_id, status, message) VALUES (?, ?, ?, ?)',
      [job_id, seeker_id, status || 'pending', message || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: 'Already applied' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// Applications: Delete an application
app.delete('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM applications WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Applications: Get applicants for a company
app.get('/api/applications/company/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT applications.*, users.name, users.email, users.phone_number, users.linkedin_link, users.bio as seekerBio, users.education_level as seekerEducation, users.skills as seekerSkills, users.embedding as seekerEmbedding, users.profile_picture, users.banner, users.resume, users.certificate, jobs.title as jobTitle, jobs.skills as jobSkills, jobs.embedding as jobEmbedding,
      (SELECT COUNT(*) FROM messages WHERE messages.application_id = applications.id AND messages.receiver_id = jobs.company_id AND messages.is_read = FALSE) as unreadCount
      FROM applications
      JOIN users ON applications.seeker_id = users.id
      JOIN jobs ON applications.job_id = jobs.id
      WHERE jobs.company_id = ?
    `, [companyId]);

    const seekerIds = rows.map(r => r.seeker_id);
    let allCertificates = [];
    if (seekerIds.length > 0) {
      const [certs] = await pool.query('SELECT * FROM seeker_certificates WHERE seeker_id IN (?)', [seekerIds]);
      allCertificates = certs;
    }
    
    const applicantsWithScore = rows.map(app => ({
      ...app,
      certificates: allCertificates.filter(c => c.seeker_id === app.seeker_id),
      matchScore: calculateMatchScore(app.seekerSkills, app.jobSkills, app.seekerEmbedding, app.jobEmbedding)
    }));

    // Sort by score (pending first, then by score)
    applicantsWithScore.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return b.matchScore - a.matchScore;
    });

    res.json(applicantsWithScore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Applications: Get applications for a seeker
app.get('/api/applications/seeker/:seekerId', async (req, res) => {
  const { seekerId } = req.params;
  try {
    const [uRows] = await pool.query('SELECT skills, embedding FROM users WHERE id = ?', [seekerId]);
    const seekerSkills = uRows[0]?.skills || '';
    const seekerEmbedding = uRows[0]?.embedding;

    const [rows] = await pool.query(`
      SELECT applications.*, jobs.title as jobTitle, jobs.description, jobs.location, jobs.salary, jobs.company_id, jobs.skills as jobSkills, jobs.embedding as jobEmbedding, users.name as companyName, users.profile_picture as companyLogo, users.banner as companyBanner, users.bio as companyBio, users.email as companyEmail, users.phone_number as companyPhone, users.website_link as companyWebsite, users.linkedin_link as companyLinkedin,
      (SELECT COUNT(*) FROM messages WHERE messages.application_id = applications.id AND messages.receiver_id = applications.seeker_id AND messages.is_read = FALSE) as unreadCount
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      JOIN users ON jobs.company_id = users.id
      WHERE applications.seeker_id = ?
      ORDER BY applications.applied_at DESC
    `, [seekerId]);
    
    const appsWithScore = rows.map(app => ({
      ...app,
      matchScore: calculateMatchScore(seekerSkills, app.jobSkills, seekerEmbedding, app.jobEmbedding)
    }));
    
    res.json(appsWithScore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Applications: Update application status (accept/reject)
app.put('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Messages: Get messages for an application
app.get('/api/messages/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT messages.*, users.name as senderName, users.profile_picture as senderProfile FROM messages JOIN users ON messages.sender_id = users.id WHERE application_id = ? ORDER BY created_at ASC',
      [applicationId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Messages: Send a new message
app.post('/api/messages', async (req, res) => {
  const { application_id, sender_id, receiver_id, content } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO messages (application_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)',
      [application_id, sender_id, receiver_id, content]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Messages: Mark as read
app.put('/api/messages/read/:applicationId/:receiverId', async (req, res) => {
  const { applicationId, receiverId } = req.params;
  try {
    await pool.query('UPDATE messages SET is_read = TRUE WHERE application_id = ? AND receiver_id = ?', [applicationId, receiverId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// AI: Generate match reason
app.post('/api/ai/match-reason', async (req, res) => {
  const { seekerId, jobId, lang = 'ms' } = req.body;
  try {
    const [seekerRows] = await pool.query('SELECT name, bio, skills FROM users WHERE id = ?', [seekerId]);
    const [jobRows] = await pool.query('SELECT title, description, skills, requirements FROM jobs WHERE id = ?', [jobId]);
    
    if (seekerRows.length === 0 || jobRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Seeker or Job not found' });
    }
    
    const seeker = seekerRows[0];
    const job = jobRows[0];
    
    let prompt = '';
    if (lang === 'en') {
      prompt = `You are an HR expert and talent acquisition manager.
Your task is to provide a brief review (maximum 3 short sentences) explaining why this applicant is a suitable match for this job.
Use friendly, professional, and constructive English. Focus on the applicant's skills that match the job requirements.
Important: Be lenient with typos (e.g., 'Phyton' vs 'Python') and case sensitivity ('reactjs' vs 'React JS'). Treat them as matching skills.

Job Details:
Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.skills}

Applicant Details:
Name: ${seeker.name}
Bio: ${seeker.bio || 'No bio'}
Skills: ${seeker.skills || 'No specific skills'}

Please generate your AI review now.`;
    } else {
      prompt = `Anda adalah seorang pakar HR dan pengurus pencarian bakat. 
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
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const reason = result.response.text();
    
    res.json({ success: true, reason });
  } catch (error) {
    console.error('AI Match Reason Error:', error);
    res.json({ success: true, reason: lang === 'en' ? "This candidate's profile strongly aligns with the core requirements of this role based on their foundational skills." : "Profil calon ini sangat sejajar dengan keperluan teras peranan ini berdasarkan kemahiran asas mereka." });
  }
});

// --- AI LEARNING RECOMMENDATION ---
app.post('/api/ai/learning-recommendation', async (req, res) => {
  const { seekerId, jobId, lang = 'ms' } = req.body;
  try {
    const [seekerRows] = await pool.query('SELECT name, skills FROM users WHERE id = ?', [seekerId]);
    const [jobRows] = await pool.query('SELECT title, description, skills, requirements FROM jobs WHERE id = ?', [jobId]);
    
    if (seekerRows.length === 0 || jobRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Seeker or Job not found' });
    }
    
    const seeker = seekerRows[0];
    const job = jobRows[0];
    
    let prompt = '';
    if (lang === 'en') {
      prompt = `You are an AI Career Coach.
Your task is to compare the applicant's skills with the job requirements, identify what is "missing" or "lacking", and suggest specific skills/knowledge the applicant should learn to improve their match score for this role.
Example: If the job is Accounting and the applicant lacks number skills, suggest learning "math and accounting".
Important: Be lenient with typos (e.g., 'Phyton' vs 'Python') and case sensitivity ('reactjs' vs 'React JS'). Do NOT suggest learning a skill if the applicant already has it but spelled it slightly differently.
Provide your response in English.

Job Details:
Title: ${job.title}
Required Skills: ${job.skills}

Applicant Details:
Current Skills: ${seeker.skills || 'No specific skills'}

The JSON structure must be exactly like this:
{
  "missingSkills": "List of missing skills (e.g., Skill A, Skill B). Write in a paragraph or bullet string.",
  "learningRecommendations": "Learning recommendations (e.g., You should take course C). Write in a paragraph."
}`;
    } else {
      prompt = `Anda adalah seorang Penasihat Kerjaya AI (AI Career Coach).
Tugasan anda adalah untuk membandingkan kemahiran pemohon dengan keperluan kerja, mengenal pasti apa yang "hilang" atau "kurang", dan mencadangkan kemahiran/ilmu spesifik yang pemohon patut belajar untuk meningkatkan peratusan (match score) mereka bagi peranan ini.
Contok: Jika kerja itu Accounting, dan pemohon kurang kemahiran nombor, cadangkan belajar "math and accounting".
Penting: Bersikap terbuka dengan kesalahan ejaan (contoh: 'Phyton' dan 'Python') serta huruf besar/kecil ('reactjs' dan 'React JS'). JANGAN cadangkan kemahiran tersebut untuk dipelajari jika pemohon sebenarnya sudah memilikinya namun dengan ejaan yang sedikit berbeza.
Berikan respons dalam Bahasa Melayu.

Maklumat Pekerjaan:
Tajuk: ${job.title}
Kemahiran Diperlukan: ${job.skills}

Maklumat Pemohon:
Kemahiran Semasa: ${seeker.skills || 'Tiada kemahiran spesifik'}

Struktur JSON mesti begini:
{
  "missingSkills": "Senarai kemahiran yang kurang (cth: Kemahiran A, Kemahiran B). Buat dalam perenggan atau bullet string.",
  "learningRecommendations": "Cadangan pembelajaran (cth: Anda patut mengambil kursus C). Buat dalam perenggan."
}`;
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const result = await model.generateContent(prompt);
    let recommendationText = result.response.text();
    recommendationText = recommendationText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let recommendationData = {};
    try {
      recommendationData = JSON.parse(recommendationText);
    } catch (e) {
      console.error("Failed to parse JSON", recommendationText);
      recommendationData = { 
        missingSkills: lang === 'en' ? "Unable to parse specific missing skills." : "Gagal mengekstrak kemahiran yang kurang.", 
        learningRecommendations: lang === 'en' ? "Please review the job description directly to see what you might be missing." : "Sila semak deskripsi kerja untuk melihat apa yang mungkin anda kurang."
      };
    }
    
    res.json({ success: true, recommendation: recommendationData });
  } catch (error) {
    console.error('AI Learning Recommendation Error:', error);
    res.json({ success: true, recommendation: {
      missingSkills: lang === 'en' ? "Advanced specific tools for this role." : "Alatan spesifik lanjutan untuk peranan ini.",
      learningRecommendations: lang === 'en' ? "Consider reviewing the job description closely to identify any specific software or frameworks you could learn to further strengthen your profile." : "Pertimbangkan untuk menyemak deskripsi kerja dengan teliti bagi mengenal pasti mana-mana perisian atau kerangka kerja spesifik yang boleh anda pelajari untuk mengukuhkan lagi profil anda."
    }});
  }
});
// --- INTERVIEWS ---

app.post('/api/interviews', async (req, res) => {
  const { application_id, company_id, seeker_id, scheduled_date, type, link_or_location, notes } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO interviews (application_id, company_id, seeker_id, scheduled_date, type, link_or_location, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [application_id, company_id, seeker_id, scheduled_date, type, link_or_location, notes]
    );
    
    // Update application status to 'accepted'
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', ['accepted', application_id]);
    
    res.status(201).json({ id: result.insertId, message: 'Interview scheduled successfully' });
  } catch (error) {
    console.error('Create Interview Error:', error);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
});

app.get('/api/interviews/company/:companyId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, u.name as seeker_name, u.email as seeker_email, u.phone_number as seeker_phone, u.linkedin_link as seeker_linkedin, u.profile_picture as seeker_picture, j.title as job_title 
      FROM interviews i 
      JOIN users u ON i.seeker_id = u.id 
      JOIN applications a ON i.application_id = a.id
      JOIN jobs j ON a.job_id = j.id
      WHERE i.company_id = ?
      ORDER BY i.scheduled_date ASC
    `, [req.params.companyId]);
    res.json(rows);
  } catch (error) {
    console.error('Get Company Interviews Error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

app.get('/api/interviews/seeker/:seekerId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, u.name as company_name, u.profile_picture as company_picture, j.title as job_title, j.location as job_location
      FROM interviews i 
      JOIN users u ON i.company_id = u.id 
      JOIN applications a ON i.application_id = a.id
      JOIN jobs j ON a.job_id = j.id
      WHERE i.seeker_id = ?
      ORDER BY i.scheduled_date ASC
    `, [req.params.seekerId]);
    res.json(rows);
  } catch (error) {
    console.error('Get Seeker Interviews Error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

app.put('/api/interviews/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE interviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Interview status updated' });
  } catch (error) {
    console.error('Update Interview Status Error:', error);
    res.status(500).json({ error: 'Failed to update interview status' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
