const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const badChunk = `  const rankingJobs = Array.from(new Set(discoverCandidates.filter(c => c.matchScore >= 1 && c.matchedJobTitle).map(c => c.matchedJobTitle)));

  return (
    <div className="theme-company min-h-screen bg-[#030213] text-foreground flex flex-col h-screen overflow-hidden relative">
        <motion.div`;

const goodChunk = `      console.error(error);
      toast.error('Server error');
    }
  };

  const rankingJobs = Array.from(new Set(discoverCandidates.filter(c => c.matchScore >= 1 && c.matchedJobTitle).map(c => c.matchedJobTitle)));

  return (
    <div className="theme-company min-h-screen bg-[#030213] text-foreground flex flex-col h-screen overflow-hidden relative">
      
      {/* Animated Background Blobs & Particles */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Fast Moving Glows */}
        <motion.div`;

if (code.includes(badChunk)) {
  code = code.replace(badChunk, goodChunk);
  fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
  console.log('Restored the deleted block safely');
} else {
  console.log('Could not find the bad chunk to replace');
}
