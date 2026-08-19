const fs = require('fs');
let html = fs.readFileSync('Hirequest_Full_Report.html', 'utf8');

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
<p style="text-align: justify; margin-top: 10px; margin-bottom: 30px;">
<strong>Explanation for Table 4.1:</strong> This test case is fundamental as it verifies the primary security mechanism of the system. The procedure systematically challenges both the frontend input validation and the backend database processing. Step 1 and 2 ensure that the user interface correctly handles erroneous user input without sending invalid data to the server, thereby saving bandwidth and preventing SQL injections or malformed database entries. Steps 3 and 4 confirm that the system's backend (using Node.js and bcrypt for password hashing) correctly creates, stores, and authenticates the user. By passing all these steps, we confirm that the system successfully issues JSON Web Tokens (JWT) to secure user sessions across the platform, preventing unauthorized access.
</p>

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
<p style="text-align: justify; margin-top: 10px; margin-bottom: 30px;">
<strong>Explanation for Table 4.2:</strong> This test case evaluates one of the most technically complex modules of the HireQuest platform: the automated data extraction pipeline. Step 1 validates the frontend constraints, ensuring users cannot upload unsupported files like malicious executables or unsupported video files. Step 2 tests the network transmission and file handling using Multer on the backend. The most critical aspect is Step 3, which confirms the seamless integration between the file system, the OCR libraries (pdf-parse and Tesseract.js), and the Google Gemini AI. Passing this step proves that the AI can successfully read unstructured resume data, logically parse it, and return structured JSON data that is then successfully mapped to the user's profile database. This automation drastically reduces the time a job seeker spends filling out forms.
</p>

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
<p style="text-align: justify; margin-top: 10px; margin-bottom: 30px;">
<strong>Explanation for Table 4.3:</strong> The semantic job matching test is designed to prove that the system is significantly smarter than legacy job boards. Step 1 confirms that the system can dynamically generate and store a high-dimensional vector array (embedding) the moment an employer creates a job post. Step 2 is the core test of the AI logic; it forces the algorithm to compare two sets of text that share no exact keyword overlap but share high contextual meaning (e.g., 'JS' and 'Frontend' naturally correlate with 'React'). Step 3 verifies the mathematical output of the Cosine Similarity equation. By displaying a high match percentage despite the lack of direct keywords, the system successfully proves its ability to understand professional context, thereby preventing highly qualified candidates from being unfairly filtered out.
</p>

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
<p style="text-align: justify; margin-top: 10px; margin-bottom: 30px;">
<strong>Explanation for Table 4.4:</strong> This operational test validates the bidirectional data flow between the Job Seeker and the Company user accounts. Step 1 tests the simplicity and efficiency of the application creation process, ensuring that the necessary foreign keys (Seeker ID and Job ID) are correctly linked in the database. Step 2 confirms that employers receive the data instantly and that the UI correctly sorts these applicants based on the previously calculated AI scores, reducing manual sorting effort. Finally, Step 3 verifies data synchronization; when an employer makes a decision, the state must update robustly in the database and reflect accurately on the job seeker's dashboard. Passing this test ensures the platform is a reliable communication bridge for recruitment.
</p>

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
<p style="text-align: justify; margin-top: 10px; margin-bottom: 30px;">
<strong>Explanation for Table 4.5:</strong> The interview scheduling module test verifies the system's capacity to handle temporal data and cross-user notifications. Step 1 validates the user interface logic, ensuring the modal correctly captures complex date/time strings and formats. Step 2 tests the backend insertion logic, verifying that an interview record is strictly bound to a valid, existing job application to prevent orphaned data. Step 3 acts as the final verification, proving that the job seeker can independently access and view these scheduled details. A successful outcome demonstrates that HireQuest effectively centralizes the hiring workflow, removing the need for external email chains or third-party scheduling tools.
</p>
<p><br><br><br></p>
<hr>
`;

html = html.substring(0, testStart) + newTest + html.substring(testEnd);

fs.writeFileSync('Hirequest_Full_Report.html', html);
fs.writeFileSync('C:\\Users\\shahr\\.gemini\\antigravity\\brain\\7be3d9a0-52b9-4d96-b839-cf3b9c31128f\\Hirequest_Full_Report.html', html);
