const fs = require('fs');

let companyCode = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');
companyCode = companyCode.replace(
  '<div className="w-10 h-10 bg-[#FF66B2]/10 rounded-[15px] flex items-center justify-center text-[#FF66B2] font-bold text-xl shadow-[0_0_15px_rgba(255,102,178,0.2)] border border-[#FF66B2]/30">H</div>',
  '<img src="/logo.png" alt="HireQuest" className="w-10 h-10 object-contain filter drop-shadow-[0_0_10px_rgba(255,102,178,0.5)]" />'
);
fs.writeFileSync('src/pages/CompanyDashboard.tsx', companyCode);

let seekerCode = fs.readFileSync('src/pages/SeekerDashboard.tsx', 'utf8');
seekerCode = seekerCode.replace(
  '<div className="w-10 h-10 bg-[#00F0FF]/10 border border-[#00F0FF]/50 rounded-lg flex items-center justify-center text-[#00F0FF] font-bold text-lg shadow-[0_0_10px_rgba(0,240,255,0.2)] shrink-0">H</div>',
  '<img src="/logo.png" alt="HireQuest" className="w-10 h-10 object-contain filter drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />'
);
fs.writeFileSync('src/pages/SeekerDashboard.tsx', seekerCode);
console.log('Logo updated');
