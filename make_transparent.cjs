const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

code = code.replace(/className="(w-full h-full overflow-y-auto[^"]*) bg-\[#030213\]/g, 'className="$1 bg-transparent');
code = code.replace(/className={\`flex-1 flex overflow-hidden relative w-full h-full bg-\[#030213\]/g, 'className={`flex-1 flex overflow-hidden relative w-full h-full bg-transparent');
code = code.replace(/className="relative w-full overflow-hidden bg-\[#030213\]/g, 'className="relative w-full overflow-hidden bg-transparent');
code = code.replace(/className="flex-1 overflow-y-auto ([^"]*) bg-\[#030213\]/g, 'className="flex-1 overflow-y-auto $1 bg-transparent');
code = code.replace(/className="w-full h-full bg-\[#030213\] overflow-y-auto/g, 'className="w-full h-full bg-transparent overflow-y-auto');

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log('Backgrounds made transparent');
