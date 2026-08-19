const fs = require('fs');

let code = fs.readFileSync('server/index.js', 'utf8');

const targetLogic = `    // 3. For each seeker, calculate the highest match score across all company jobs
    const candidates = seekers.map(seeker => {
      let bestMatchScore = 0;
      let matchedJobTitle = '';
      let matchedJobId = null;
      
      for (const job of jobs) {
        const score = calculateMatchScore(seeker.skills, job.skills, seeker.embedding, job.embedding);
        if (score > bestMatchScore || matchedJobId === null) {
          bestMatchScore = score;
          matchedJobTitle = job.title;
          matchedJobId = job.id;
        }
      }

      return {
        ...seeker,
        certificates: allCertificates.filter(c => c.seeker_id === seeker.id),
        matchScore: bestMatchScore,
        matchedJobTitle: matchedJobTitle,
        matchedJobId: matchedJobId
      };
    });`;

const replacementLogic = `    // 3. For each seeker, calculate the match score for ALL company jobs
    const candidates = [];
    for (const seeker of seekers) {
      for (const job of jobs) {
        const score = calculateMatchScore(seeker.skills, job.skills, seeker.embedding, job.embedding);
        // Only include candidates that have some level of match, or all if we want to show 0% matches too
        candidates.push({
          ...seeker,
          certificates: allCertificates.filter(c => c.seeker_id === seeker.id),
          matchScore: score,
          matchedJobTitle: job.title,
          matchedJobId: job.id
        });
      }
    }`;

if (code.includes(targetLogic)) {
  code = code.replace(targetLogic, replacementLogic);
  fs.writeFileSync('server/index.js', code);
  console.log('Backend logic updated to return multiple matches per seeker');
} else {
  console.log('Target logic not found in server/index.js');
}
