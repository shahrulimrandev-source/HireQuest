const fs = require('fs');

// LandingPage
let landingCode = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');
landingCode = landingCode.replace(
  '<span className="font-heading font-extrabold text-2xl tracking-tight text-slate-800">HireQuest</span>',
  '<span className="font-heading font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-[#22b3c1] to-slate-800 animate-text-shine">HireQuest</span>'
);
fs.writeFileSync('src/pages/LandingPage.tsx', landingCode);

// LoginPage
let loginCode = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
loginCode = loginCode.replace(
  '<span className="font-heading font-bold text-3xl tracking-tight">HireQuest</span>',
  '<span className="font-heading font-bold text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#22b3c1] to-white animate-text-shine">HireQuest</span>'
);
loginCode = loginCode.replace(
  '<span className="font-heading font-bold text-2xl tracking-tight text-slate-800">HireQuest</span>',
  '<span className="font-heading font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-[#22b3c1] to-slate-800 animate-text-shine">HireQuest</span>'
);
fs.writeFileSync('src/pages/LoginPage.tsx', loginCode);

// CompanyDashboard
let companyCode = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');
companyCode = companyCode.replace(
  '<span className="font-heading font-bold text-2xl hidden sm:block text-white tracking-tight">HireQuest <span className="text-[10px] font-bold text-[#FF66B2] bg-[#FF66B2]/10 px-2 py-1 rounded-[23px] ml-1 uppercase tracking-wider align-middle border border-[#FF66B2]/20">Employer</span></span>',
  '<span className="font-heading font-bold text-2xl hidden sm:block tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FF66B2] to-white animate-text-shine">HireQuest</span> <span className="text-[10px] font-bold text-[#FF66B2] bg-[#FF66B2]/10 px-2 py-1 rounded-[23px] ml-1 uppercase tracking-wider align-middle border border-[#FF66B2]/20 text-white">Employer</span></span>'
);
fs.writeFileSync('src/pages/CompanyDashboard.tsx', companyCode);

// SeekerDashboard
let seekerCode = fs.readFileSync('src/pages/SeekerDashboard.tsx', 'utf8');
seekerCode = seekerCode.replace(
  '<span className="font-heading font-bold text-2xl hidden lg:block text-white">Hire<span className="text-[#00F0FF]">Quest</span> <span className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-2.5 py-1 rounded-sm ml-2 tracking-widest uppercase">Job Seeker</span></span>',
  '<span className="font-heading font-bold text-2xl hidden lg:block tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00F0FF] to-white animate-text-shine">HireQuest</span> <span className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-2.5 py-1 rounded-sm ml-2 tracking-widest uppercase text-white">Job Seeker</span></span>'
);
fs.writeFileSync('src/pages/SeekerDashboard.tsx', seekerCode);
console.log('Animated logo text applied');
