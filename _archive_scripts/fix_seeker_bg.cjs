const fs = require('fs');

let code = fs.readFileSync('src/pages/SeekerDashboard.tsx', 'utf8');

// Replace the main wrappers' background with transparent
code = code.replace(/className={\`flex-1 flex overflow-hidden relative w-full h-full bg-\[#030213\]\`}/g, 'className={`flex-1 flex overflow-hidden relative w-full h-full bg-transparent`}');
code = code.replace(/className="w-full h-full overflow-y-auto bg-\[#030213\]/g, 'className="w-full h-full overflow-y-auto bg-transparent');
code = code.replace(/className="w-full h-full bg-\[#030213\] overflow-y-auto/g, 'className="w-full h-full bg-transparent overflow-y-auto');

fs.writeFileSync('src/pages/SeekerDashboard.tsx', code);
console.log('Fixed Seeker transparency');
