const fs = require('fs');

// LandingPage
let landingCode = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');
landingCode = landingCode.replace(
  '<div className="w-10 h-10 bg-gradient-to-br from-[#22b3c1] to-blue-600 rounded-[12px] flex items-center justify-center text-white font-bold text-2xl shadow-md">H</div>',
  '<img src="/logo.png" alt="HireQuest" className="w-10 h-10 object-contain" />'
);
fs.writeFileSync('src/pages/LandingPage.tsx', landingCode);

// LoginPage (has two instances)
let loginCode = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
loginCode = loginCode.replace(
  '<div className="w-12 h-12 bg-gradient-to-br from-[#22b3c1] to-blue-600 rounded-[14px] flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-[#22b3c1]/20">H</div>',
  '<img src="/logo.png" alt="HireQuest" className="w-12 h-12 object-contain" />'
);
loginCode = loginCode.replace(
  '<div className="w-10 h-10 bg-gradient-to-br from-[#22b3c1] to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md">H</div>',
  '<img src="/logo.png" alt="HireQuest" className="w-10 h-10 object-contain" />'
);
fs.writeFileSync('src/pages/LoginPage.tsx', loginCode);
console.log('Other logos updated');
