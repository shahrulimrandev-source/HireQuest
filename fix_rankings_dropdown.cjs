const fs = require('fs');

let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// 1. Fetch company jobs on rankings tab too
if (!code.includes("if (activeTab === 'discover' || activeTab === 'rankings') {")) {
  code = code.replace(
    "if (activeTab === 'discover' || activeTab === 'rankings') fetchDiscoverCandidates();",
    "if (activeTab === 'discover' || activeTab === 'rankings') {\n      fetchDiscoverCandidates();\n      fetchCompanyJobs();\n    }"
  );
}

// 2. Change the dropdown source
// Find the dropdown map
code = code.replace(
  "{rankingJobs.map((job, idx) => (",
  "{companyJobs.map((job, idx) => ("
);
code = code.replace(
  "<option key={idx} value={job as string}>{job as string}</option>",
  "<option key={idx} value={job.title}>{job.title}</option>"
);

// We still keep rankingJobs check because it might be empty if we just use companyJobs? 
// No, we want to show the dropdown if companyJobs.length > 0!
code = code.replace(
  "{rankingJobs.length > 0 && (",
  "{companyJobs.length > 0 && ("
);

// 3. Remove the old rankingJobs variable as it's no longer used
const rankingJobsLine = "const rankingJobs = Array.from(new Set(discoverCandidates.filter(c => c.matchScore >= 1 && c.matchedJobTitle).map(c => c.matchedJobTitle)));";
if (code.includes(rankingJobsLine)) {
  code = code.replace(rankingJobsLine, "");
}

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log('Fixed rankings dropdown to show all company jobs');
