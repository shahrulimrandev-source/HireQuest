const fs = require('fs');

let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// 1. Add state
if (!code.includes('const [rankingJobFilter')) {
  code = code.replace(
    "const [discoverSearchQuery, setDiscoverSearchQuery] = useState('');",
    "const [discoverSearchQuery, setDiscoverSearchQuery] = useState('');\n  const [rankingJobFilter, setRankingJobFilter] = useState('all');"
  );
}

// 2. Add rankingJobs derived state before return
if (!code.includes('const rankingJobs')) {
  code = code.replace(
    "return (",
    "const rankingJobs = Array.from(new Set(discoverCandidates.filter(c => c.matchScore >= 1 && c.matchedJobTitle).map(c => c.matchedJobTitle)));\n\n  return ("
  );
}

// 3. Add UI Dropdown
const uiTarget = '<h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Top Candidate Matches</h1>';
const uiReplacement = `${uiTarget}
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

if (code.includes(uiTarget) && !code.includes('Filter by Job:')) {
  code = code.replace(uiTarget, uiReplacement);
}

// 4. Update filtering logic
const filterTarget1 = 'discoverCandidates.filter(c => c.matchScore >= 1).length === 0';
const filterReplacement1 = 'discoverCandidates.filter(c => c.matchScore >= 1 && (rankingJobFilter === "all" || c.matchedJobTitle === rankingJobFilter)).length === 0';

if (code.includes(filterTarget1)) {
  code = code.replace(filterTarget1, filterReplacement1);
}

const filterTarget2 = 'discoverCandidates.filter(c => c.matchScore >= 1).map((candidate, index) => (';
const filterReplacement2 = 'discoverCandidates.filter(c => c.matchScore >= 1 && (rankingJobFilter === "all" || c.matchedJobTitle === rankingJobFilter)).sort((a,b) => (b.matchScore || 0) - (a.matchScore || 0)).map((candidate, index) => (';

if (code.includes(filterTarget2)) {
  code = code.replace(filterTarget2, filterReplacement2);
}

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log('Added ranking filter feature');
