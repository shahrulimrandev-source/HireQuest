const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const badChunk = `                  <div className="w-16 h-16 bg-[#111827] border border-[#334155] shadow-[0_0_15px_rgba(0,0,0,0.5)] rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-gray-500">0</div>
                    onInvite={handleDiscoverSwipeRight}
                    rank={index + 1}
                  />`;

const goodChunk = `                  <div className="w-16 h-16 bg-[#111827] border border-[#334155] shadow-[0_0_15px_rgba(0,0,0,0.5)] rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-gray-500">0</div>
                  <h3 className="text-xl font-bold font-heading text-white">No Matches Found</h3>
                  <p className="text-gray-400">No candidates match your jobs above 0%.</p>
                </div>
              ) : (
                discoverCandidates.filter(c => c.matchScore >= 1 && (rankingJobFilter === "all" || c.matchedJobTitle === rankingJobFilter)).sort((a,b) => (b.matchScore || 0) - (a.matchScore || 0)).map((candidate, index) => (
                  <CandidateFeedBlock 
                    key={\`\${candidate.id}-\${candidate.matchedJobId}\`}
                    candidate={candidate}
                    fetchingReasonId={fetchingReasonId}
                    fetchAiReason={fetchAiReason}
                    aiReasons={aiReasons}
                    onExploreCandidate={setSelectedCandidateModal}
                    onInvite={handleDiscoverSwipeRight}
                    rank={index + 1}
                  />`;

if (code.includes(badChunk)) {
  code = code.replace(badChunk, goodChunk);
  fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
  console.log('Restored the Rankings block properly');
} else {
  // Regex fallback
  const regex = /<div className="w-16 h-16 bg-\[\#111827\] border border-\[\#334155\] shadow-\[0_0_15px_rgba\(0,0,0,0\.5\)\] rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-gray-500">0<\/div>\s*onInvite=\{handleDiscoverSwipeRight\}\s*rank=\{index \+ 1\}\s*\/>/m;
  if (regex.test(code)) {
    code = code.replace(regex, goodChunk);
    fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
    console.log('Restored the Rankings block properly using regex');
  } else {
    console.log('Failed to find bad chunk');
  }
}
