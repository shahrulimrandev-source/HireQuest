const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// 1. Remove the bad rankingJobs injection
code = code.replace(
  `const rankingJobs = Array.from(new Set(discoverCandidates.filter(c => c.matchScore >= 1 && c.matchedJobTitle).map(c => c.matchedJobTitle)));

  return (localStorage.getItem('aiLanguage') as 'ms' | 'en') || 'ms';`,
  `return (localStorage.getItem('aiLanguage') as 'ms' | 'en') || 'ms';`
);

// 2. Put rankingJobs right before the main component return statement
// Find the exact main return statement
code = code.replace(
  `  return (
    <div className="min-h-screen bg-[#030213] text-gray-100 flex flex-col font-sans overflow-hidden">`,
  `  const rankingJobs = Array.from(new Set(discoverCandidates.filter(c => c.matchScore >= 1 && c.matchedJobTitle).map(c => c.matchedJobTitle)));

  return (
    <div className="min-h-screen bg-[#030213] text-gray-100 flex flex-col font-sans overflow-hidden">`
);

// 3. Inject the UI into the Rankings tab
const uiTarget = `<h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Top Candidate Matches</h1>`;

const uiReplacement = `<h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Top Candidate Matches</h1>
                {rankingJobs.length > 0 && (
                  <div className="mt-6 flex items-center justify-center gap-3 relative z-20">
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Filter by Job:</span>
                    <select 
                      value={rankingJobFilter} 
                      onChange={(e) => setRankingJobFilter(e.target.value)}
                      className="bg-[#111827] border border-[#FF66B2]/30 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-[#FF66B2] focus:ring-1 focus:ring-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] font-bold cursor-pointer hover:bg-[#1E293B] transition-colors"
                    >
                      <option value="all">All Open Jobs</option>
                      {rankingJobs.map((job, idx) => (
                        <option key={idx} value={job as string}>{job as string}</option>
                      ))}
                    </select>
                  </div>
                )}`;

if (code.includes(uiTarget) && !code.includes('Filter by Job:</span>')) {
  code = code.replace(uiTarget, uiReplacement);
  console.log('UI injected');
} else {
  console.log('UI target not found or already injected');
}

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log('Fixed script done');
