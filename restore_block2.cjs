const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const badChunk = `    } catch (error) {
        <motion.div`;

const goodChunk = `    } catch (error) {
      console.error(error);
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
  console.log('Restored perfectly');
} else {
  console.log('Could not find exact chunk. Trying another match.');
  // Fallback if line endings differ
  const regex = /\} catch \(error\) \{\s*<motion\.div/;
  if (regex.test(code)) {
    code = code.replace(regex, goodChunk);
    fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
    console.log('Restored perfectly using regex');
  } else {
    console.log('Regex also failed');
  }
}
