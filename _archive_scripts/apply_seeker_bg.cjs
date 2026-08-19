const fs = require('fs');

let code = fs.readFileSync('src/pages/SeekerDashboard.tsx', 'utf8');

// 1. Ensure framer-motion is imported
if (!code.includes('import { AnimatePresence, motion } from \'framer-motion\';')) {
  // Try to find the react import
  const reactImportIdx = code.indexOf('import React');
  const endOfReactImport = code.indexOf('\n', reactImportIdx);
  code = code.substring(0, endOfReactImport + 1) + "import { AnimatePresence, motion } from 'framer-motion';\n" + code.substring(endOfReactImport + 1);
} else if (!code.includes(' motion } from \'framer-motion\'')) {
  // If AnimatePresence is imported but not motion, update it
  code = code.replace(/import \{ AnimatePresence \} from 'framer-motion';/, "import { AnimatePresence, motion } from 'framer-motion';");
}

// 2. Change the wrapper div
const targetReturn = '    <div className="theme-seeker min-h-screen bg-background text-foreground flex flex-col h-screen overflow-hidden">';
const newReturn = `    <div className="theme-seeker min-h-screen bg-[#0B1120] text-foreground flex flex-col h-screen overflow-hidden relative">
      {/* Floating Tech Particles + Aurora */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-[-20%] left-[-10%] right-[-10%] h-[60%] bg-[#00F0FF]/10 blur-[150px] rounded-full" />
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[40%] bg-[#3B82F6]/10 blur-[150px] rounded-full" />
        
        {/* Floating Data Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-[#00F0FF] rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              y: ['100vh', '-10vh'],
              x: [0, Math.random() * 50 - 25, 0],
            }}
            transition={{
              y: {
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * -30,
              },
              x: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          />
        ))}
      </div>`;

if (code.includes(targetReturn)) {
  code = code.replace(targetReturn, newReturn);
} else {
  console.log("Could not find the target return wrapper in SeekerDashboard!");
}

// 3. Apply bg-transparent to the main wrappers to avoid obscuring the animation
code = code.replace(/className="(w-full h-full overflow-y-auto[^"]*) bg-\[#0B1120\]/g, 'className="$1 bg-transparent');
code = code.replace(/className={\`flex-1 flex overflow-hidden relative w-full h-full bg-\[#0B1120\]/g, 'className={`flex-1 flex overflow-hidden relative w-full h-full bg-transparent');
code = code.replace(/className="relative w-full overflow-hidden bg-\[#0B1120\]/g, 'className="relative w-full overflow-hidden bg-transparent');
code = code.replace(/className="flex-1 overflow-y-auto ([^"]*) bg-\[#0B1120\]/g, 'className="flex-1 overflow-y-auto $1 bg-transparent');
code = code.replace(/className="w-full h-full bg-\[#0B1120\] overflow-y-auto/g, 'className="w-full h-full bg-transparent overflow-y-auto');

fs.writeFileSync('src/pages/SeekerDashboard.tsx', code);
console.log('Applied Seeker background animation and transparency.');
