const fs = require('fs');
let html = fs.readFileSync('Hirequest_Full_Report.html', 'utf8');

// Replace Chapter 2
const ch2Start = html.indexOf('<h2>CHAPTER 2: LITERATURE REVIEW</h2>');
const ch3Start = html.indexOf('<h2>CHAPTER 3: METHODOLOGY</h2>');
const newCh2 = `<h2>CHAPTER 2: LITERATURE REVIEW</h2>
<h3>2.1 Introduction</h3>
<p>This chapter discusses the literature review used to develop the system. It consists of a study on existing systems to identify areas for improvement and discusses the AI Semantic Embedding methods implemented in the proposed system. A literature review is a critical evaluation of previous research, systems, and technologies relevant to the proposed Job Matching System. By analyzing the strengths and limitations of current platforms, the HireQuest system is designed to introduce a more intelligent, context-aware matching algorithm that benefits both job seekers and employers.</p>
<h3>2.2 Research on Existing Systems</h3>
<p>To understand the current landscape of digital recruitment platforms, several widely used systems were analyzed. This section highlights their operational mechanisms, strengths, and primary weaknesses, particularly focusing on how they match candidates to jobs.</p>
<h4>2.2.1 LinkedIn</h4>
<p>LinkedIn is arguably the most famous professional networking platform globally, focusing heavily on job search, recruitment, and B2B networking. It allows job seekers to create comprehensive digital profiles that include their resumes, detailed work experience, educational background, skills, and industry certifications. Employers can post jobs and use LinkedIn Recruiter tools to search for candidates based on filters.</p>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT EXISTING SYSTEM: LINKEDIN DI SINI ]</strong>
</div>
<p><strong>Strengths:</strong></p>
<ul>
<li>Strong professional networking capabilities that allow passive job searching and headhunting.</li>
<li>A massive global database of professionals from various industries.</li>
<li>Features like "Easy Apply" streamline the application process for users.</li>
</ul>
<p><strong>Weaknesses:</strong></p>
<ul>
<li>The matching process and recommendation feed are not fully transparent to the user; it is often unclear why certain jobs are recommended.</li>
<li>Heavily dependent on rigid keyword matching and profile completeness. If a candidate uses synonymous terms not recognized by the algorithm, they may be overlooked.</li>
<li>No clear, percentage-based matching score is shown to users to help them gauge their true suitability before applying.</li>
</ul>
<h4>2.2.2 JobStreet</h4>
<p>JobStreet is a prominent online job portal widely used across Southeast Asia. It focuses primarily on job posting and direct application services, acting as a bridge between local employers and job seekers.</p>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT EXISTING SYSTEM: JOBSTREET DI SINI ]</strong>
</div>
<p><strong>Strengths:</strong></p>
<ul>
<li>Simple, straightforward, and user-friendly interface tailored for quick job searching.</li>
<li>Well-structured job categories and localized job market data.</li>
<li>Provides salary insights and company reviews to assist candidates in decision-making.</li>
</ul>
<p><strong>Weaknesses:</strong></p>
<ul>
<li>Limited intelligent matching features. The platform relies heavily on manual filtering by the user (e.g., filtering by salary, location, and specific job titles).</li>
<li>Job recommendations are almost entirely keyword-based. It fails to recognize synonymous skills or overlapping technological stacks (e.g., a candidate knowing "Vue.js" might be suitable for a "React.js" role if the employer is willing to train, but strict keyword matching will filter them out).</li>
<li>Employers must manually screen hundreds of applicants, leading to decision fatigue and inefficiencies in the hiring process.</li>
</ul>
<h4>2.2.3 Indeed</h4>
<p>Indeed is a global employment website for job listings that aggregates job postings from thousands of websites, job boards, staffing firms, and company career pages.</p>
<p><strong>Strengths:</strong></p>
<ul>
<li>Massive aggregation of job listings ensures a vast quantity of opportunities.</li>
<li>Simple search interface based on "What" and "Where".</li>
</ul>
<p><strong>Weaknesses:</strong></p>
<ul>
<li>The sheer volume of postings often leads to spam or duplicate listings.</li>
<li>Keyword matching is very basic, often returning irrelevant results if a keyword appears in a different context.</li>
</ul>
<h3>2.3 Semantic Embeddings and Multi-Criteria Algorithms</h3>
<p>To overcome the significant limitations of traditional Boolean and keyword-based search systems, HireQuest incorporates advanced Artificial Intelligence techniques, specifically Semantic Embeddings and Levenshtein Distance algorithms.</p>
<h4>2.3.1 The Limitation of Traditional Keyword Matching</h4>
<p>Traditional systems often use techniques like TF-IDF (Term Frequency-Inverse Document Frequency) or basic string matching. While effective for exact matches, these fail to capture the meaning or context of words. For example, a candidate listing "Frontend Development" and an employer looking for "UI/UX Engineering" might be a strong match, but a strict keyword system would assign a match score of zero, causing the employer to miss out on a qualified candidate.</p>
<h4>2.3.2 Semantic Embeddings using AI</h4>
<p>According to Singla (2025), intelligent job recommendation systems based on semantic embeddings significantly improve matching accuracy by understanding the contextual meaning of words. Embeddings convert text into high-dimensional numerical vectors (arrays of floating-point numbers). Words or phrases with similar meanings are positioned closer together in this mathematical vector space. HireQuest utilizes Google Generative AI to generate these embeddings. By converting both the job requirements and the applicant's extracted skills into vectors, the system can mathematically determine their contextual similarity.</p>
<h4>2.3.3 Cosine Similarity</h4>
<p>To calculate the distance between the job vector and the candidate vector, HireQuest uses Cosine Similarity. Unlike Euclidean distance, which measures the straight-line distance and can be skewed by the length of the text (e.g., a very long resume vs a short job description), Cosine Similarity measures the cosine of the angle between two vectors. This ensures that the matching score focuses purely on the orientation (meaning) of the text rather than its magnitude (length), providing a more accurate matching percentage.</p>
<h4>2.3.4 Levenshtein Distance for Typo-Tolerance</h4>
<p>While semantic embeddings handle context, real-world data from OCR-extracted resumes often contains typographical errors (e.g., extracting "Jvascript" instead of "Javascript" from a slightly blurry PDF). To ensure that these minor errors do not severely penalize a candidate, HireQuest employs the Levenshtein Distance algorithm. This algorithm calculates the minimum number of single-character edits (insertions, deletions, or substitutions) required to change one word into another. By combining this with the semantic score in a Weighted Sum Model, HireQuest computes a final, transparent matching percentage for the user, ensuring both contextual understanding and keyword resilience.</p>
<h3>2.4 Summary</h3>
<p>The review of existing job portals like LinkedIn, JobStreet, and Indeed reveals a persistent reliance on exact keyword matching, which leads to inefficiencies for both job seekers and employers. By integrating AI-driven Semantic Embeddings, Cosine Similarity, and Levenshtein Distance, HireQuest proposes a modern, context-aware solution that provides transparent, highly accurate candidate matching.</p>
<p><br><br><br></p>
<hr>
`;

html = html.substring(0, ch2Start) + newCh2 + html.substring(ch3Start);

// Replace Chapter 4 Interface Design
const ch4Start = html.indexOf('<h3>4.2 Interface Design</h3>');
const ch4End = html.indexOf('<h3>4.3 Coding Snippet: The Matching Algorithm</h3>');
const newCh4 = `<h3>4.2 Interface Design</h3>
<p>The user interface was built using <strong>React, TailwindCSS, and Framer Motion</strong> to ensure a modern, responsive, and engaging user experience. The design prioritizes ease of use and clearly presents the AI matching scores to users.</p>
<h4>4.2.1 Login &amp; Registration Page</h4>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT: LOGIN / REGISTRATION PAGE ]</strong>
</div>
<p>The authentication pages are designed to be intuitive, allowing users to choose their role (Job Seeker or Company) during registration. Secure sessions are managed carefully to protect user data.</p>
<h4>4.2.2 Job Seeker Dashboard (&quot;For You&quot; Page)</h4>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT: JOB SEEKER DASHBOARD / FOR YOU PAGE ]</strong>
</div>
<p>The Job Seeker dashboard displays recommended job positions. Each listing prominently displays the Matching Percentage (e.g., 85% Match) calculated by the backend AI algorithm. Users can view detailed requirements and click "Quick Apply".</p>
<h4>4.2.3 Resume Upload and OCR Parsing Interface</h4>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT: RESUME UPLOAD &amp; PARSING RESULT ]</strong>
</div>
<p>This interface allows job seekers to upload their PDF resumes. The system visually indicates the parsing process. Once completed, it displays the extracted text, intelligently sorting the extracted data into categories such as 'Skills' and 'Experience', leveraging the integrated OCR technologies.</p>
<h4>4.2.4 Job Seeker Profile and Skills Management</h4>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT: USER PROFILE / SKILL SETTINGS ]</strong>
</div>
<p>Users have full control over their profiles. If the automated OCR misses a specific skill or they acquire a new one, job seekers can manually add or remove skills and update their job preferences (e.g., Remote, Full-time). These updates immediately trigger a recalculation of their AI semantic embeddings.</p>
<h4>4.2.5 Company Dashboard and Job Posting Page</h4>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT: COMPANY DASHBOARD / CREATE JOB POST ]</strong>
</div>
<p>Companies are provided with a clean dashboard to manage their job listings. When creating a new job post, employers input the job title, description, and specific required skills. The backend instantly generates an AI embedding for this new job posting to prepare it for matching with potential candidates.</p>
<h4>4.2.6 AI "Top Matches" &amp; Rankings Page</h4>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT: TOP MATCHES / RANKINGS PAGE ]</strong>
</div>
<p>The platform features a dedicated "Rankings" and "Matches" interface. For Job Seekers, it displays a highly curated list of companies that perfectly align with their semantic skills. For Companies, it displays the highest-ranking candidates in the system. The interface prominently highlights the AI Matching Percentage, ensuring users focus on the most relevant opportunities first.</p>
<h4>4.2.7 Application Management &amp; Tracking</h4>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT: SEEKER "MY APPLICATIONS" DAN COMPANY "APPLICANTS" ]</strong>
</div>
<p>Transparency in the hiring process is essential. Job Seekers have an "Applications" tab to track the real-time status of their submitted applications (e.g., Pending, Shortlisted, Accepted). Conversely, the Company Dashboard includes an "Applicants" tab, allowing employers to review, filter, and seamlessly update the status of each applicant.</p>
<h4>4.2.8 Interview Scheduling Module</h4>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT: INTERVIEWS TAB ]</strong>
</div>
<p>To streamline communication, HireQuest includes an integrated Interview module. Once an employer shortlists a candidate, they can schedule an interview directly through the platform. Both the employer and the job seeker can view their upcoming schedules, interview types (virtual or in-person), and relevant links or locations in the "Interviews" tab.</p>
<h4>4.2.9 Discover Feed (Social Networking Feature)</h4>
<div style="background:#e9ecef; width:100%; height:250px; display:flex; align-items:center; justify-content:center; border:2px dashed #adb5bd; margin-bottom: 20px;">
  <strong>[ SILA MASUKKAN SCREENSHOT: DISCOVER TAB ]</strong>
</div>
<p>Taking inspiration from modern professional networking sites, the "Discover" feed acts as a social timeline. Companies can post updates, media, or company culture advertisements. Job Seekers can scroll through this feed to engage with potential employers, bridging the gap between rigid job applications and modern social networking.</p>
`;

html = html.substring(0, ch4Start) + newCh4 + html.substring(ch4End);

// Replace Chapter 4 Test Cases
const testStart = html.indexOf('<h3>4.4 Test Cases</h3>');
const testEnd = html.indexOf('<h2>CHAPTER 5: CONCLUSION</h2>');
const newTest = `<h3>4.4 Test Cases</h3>
<p>System testing was conducted to ensure all modules and functionalities operate exactly as specified in the system requirements. The objective of these test cases is to validate the reliability, security, and performance of the core features within the HireQuest platform. Each test case evaluates a specific user flow, ensuring that both normal operations and edge cases are handled gracefully by the system.</p>

<h4>4.4.1 Authentication and Access Control</h4>
<p>The authentication module is the gateway to the system. This test ensures that users (both job seekers and companies) can securely register, login, and that unauthorized access is prevented. Proper validation of email formats and password matching is crucial to maintain data integrity and security.</p>
<p><strong>Table 4.1: Test Case for User Registration &amp; Login</strong></p>
<table>
<thead>
<tr>
<th>Step</th>
<th>Procedure</th>
<th>Expected Result</th>
<th>Pass/Fail</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>Navigate to the Registration page and select a user role.</td>
<td>The Registration page loads successfully with role options displayed.</td>
<td>Pass</td>
</tr>
<tr>
<td>2</td>
<td>Enter an invalid email format (e.g., "user@com") and submit.</td>
<td>The system rejects the input and displays a clear validation error message.</td>
<td>Pass</td>
</tr>
<tr>
<td>3</td>
<td>Enter valid credentials, ensure passwords match, and submit the form.</td>
<td>The account is successfully created in the database and the user is redirected to the login page.</td>
<td>Pass</td>
</tr>
<tr>
<td>4</td>
<td>Login using the newly created valid credentials.</td>
<td>The user is authenticated via JWT and successfully redirected to their respective Dashboard.</td>
<td>Pass</td>
</tr>
</tbody>
</table>

<h4>4.4.2 Automated Resume Parsing and Extraction</h4>
<p>A core feature of HireQuest is its ability to reduce manual data entry by extracting text directly from uploaded documents. This test case verifies the robustness of the Optical Character Recognition (OCR) integration (Tesseract.js and pdf-parse) and ensures the Gemini AI correctly categorizes the extracted text into professional bios and skills.</p>
<p><strong>Table 4.2: Test Case for AI Resume Upload &amp; Extraction</strong></p>
<table>
<thead>
<tr>
<th>Step</th>
<th>Procedure</th>
<th>Expected Result</th>
<th>Pass/Fail</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>Click the 'Upload Resume' button on the Job Seeker Profile page.</td>
<td>The native file selection dialog opens, accepting only valid file types (PDF, JPG, PNG).</td>
<td>Pass</td>
</tr>
<tr>
<td>2</td>
<td>Upload a valid PDF resume file.</td>
<td>The file is accepted by the frontend and securely transmitted to the backend server.</td>
<td>Pass</td>
</tr>
<tr>
<td>3</td>
<td>Wait for backend OCR processing and AI analysis to complete.</td>
<td>The system extracts the text, identifies key skills, and automatically populates the user's 'Skills' and 'Bio' fields in the database and UI without manual input.</td>
<td>Pass</td>
</tr>
</tbody>
</table>

<h4>4.4.3 Semantic AI Job Matching Algorithm</h4>
<p>This test evaluates the system's primary innovation: the AI semantic matching engine. Unlike traditional keyword searches, the system must demonstrate its ability to match candidates with jobs based on contextual relevance (Cosine Similarity) even if the exact keywords do not match.</p>
<p><strong>Table 4.3: Test Case for Semantic Job Matching</strong></p>
<table>
<thead>
<tr>
<th>Step</th>
<th>Procedure</th>
<th>Expected Result</th>
<th>Pass/Fail</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>A Company posts a new job vacancy for a "React Developer" with specific requirements.</td>
<td>The job is saved in the database, and a semantic embedding vector is generated for the job description.</td>
<td>Pass</td>
</tr>
<tr>
<td>2</td>
<td>A Job Seeker whose profile lists "Frontend, JS, Tailwind" (but lacks the word "React") logs into the system.</td>
<td>The system retrieves the seeker's embedding and calculates the Cosine Similarity against available jobs.</td>
<td>Pass</td>
</tr>
<tr>
<td>3</td>
<td>The Job Seeker navigates to the "For You" (Top Matches) page.</td>
<td>The "React Developer" job appears with a high Match Score percentage, proving the semantic algorithm successfully recognized the contextual relationship between "Frontend/JS" and "React".</td>
<td>Pass</td>
</tr>
</tbody>
</table>

<h4>4.4.4 Application Management and Tracking</h4>
<p>This test ensures that the lifecycle of a job application—from submission by the seeker to review and status updates by the employer—functions flawlessly. Real-time updates are essential for a smooth user experience.</p>
<p><strong>Table 4.4: Test Case for Job Application and Status Update</strong></p>
<table>
<thead>
<tr>
<th>Step</th>
<th>Procedure</th>
<th>Expected Result</th>
<th>Pass/Fail</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>The Job Seeker clicks "Quick Apply" on a recommended job listing.</td>
<td>The application is submitted, and a new record is created in the database with a "Pending" status.</td>
<td>Pass</td>
</tr>
<tr>
<td>2</td>
<td>The Company logs in and navigates to the "Applicants Review" tab for that specific job.</td>
<td>The seeker's profile appears in the applicant list, accurately ranked by their AI match score.</td>
<td>Pass</td>
</tr>
<tr>
<td>3</td>
<td>The Company clicks "Update Status" and changes the application status to "Shortlisted" or "Accepted".</td>
<td>The database is updated successfully, and the Job Seeker immediately sees the updated status reflected in their "My Applications" tab.</td>
<td>Pass</td>
</tr>
</tbody>
</table>

<h4>4.4.5 Interview Scheduling and Integration</h4>
<p>To facilitate direct communication, the platform allows companies to schedule interviews with shortlisted candidates. This test case validates the creation, storage, and display of interview schedules across both user roles.</p>
<p><strong>Table 4.5: Test Case for Interview Scheduling Module</strong></p>
<table>
<thead>
<tr>
<th>Step</th>
<th>Procedure</th>
<th>Expected Result</th>
<th>Pass/Fail</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>A Company selects a shortlisted applicant and clicks "Schedule Interview".</td>
<td>A modal appears prompting the company to enter the date, time, format (Virtual/In-person), and meeting link.</td>
<td>Pass</td>
</tr>
<tr>
<td>2</td>
<td>The Company submits the interview details.</td>
<td>The interview data is securely saved in the database, linked to both the application and the specific users.</td>
<td>Pass</td>
</tr>
<tr>
<td>3</td>
<td>The Job Seeker navigates to their "Interviews" tab.</td>
<td>The newly scheduled interview appears on their dashboard, displaying the correct time, date, and actionable meeting link.</td>
<td>Pass</td>
</tr>
</tbody>
</table>
<p><br><br><br></p>
<hr>
`;

html = html.substring(0, testStart) + newTest + html.substring(testEnd);

fs.writeFileSync('Hirequest_Full_Report.html', html);
fs.writeFileSync('C:\\Users\\shahr\\.gemini\\antigravity\\brain\\7be3d9a0-52b9-4d96-b839-cf3b9c31128f\\Hirequest_Full_Report.html', html);
