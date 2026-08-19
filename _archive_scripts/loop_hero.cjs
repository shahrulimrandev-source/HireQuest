const fs = require('fs');

let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

// Add state for looping
if (!code.includes('const [loopKey, setLoopKey] = useState(0);')) {
  const containerRefCode = 'const containerRef = useRef<HTMLDivElement>(null);';
  const loopCode = `  const [loopKey, setLoopKey] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setLoopKey(prev => prev + 1);
    }, 8000); // Loop every 8 seconds
    return () => clearInterval(interval);
  }, []);\n`;
  code = code.replace(containerRefCode, containerRefCode + '\n' + loopCode);
  
  // Make sure useState and useEffect are imported
  if (!code.includes('useState') && !code.includes('useEffect')) {
    code = code.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';");
  } else if (!code.includes('useState')) {
    code = code.replace("useEffect", "useEffect, useState");
  } else if (!code.includes('useEffect')) {
    code = code.replace("useState", "useState, useEffect");
  }
}

// Update the motion.h1 to use the loopKey
code = code.replace(
  /<motion\.h1[^>]*className="text-5xl md:text-7xl lg:text-8xl[^>]*>/,
  `<motion.h1 
                  key={loopKey}
                  className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-heading tracking-tight mb-6 md:mb-8 leading-[1.1] text-slate-800 flex flex-wrap justify-center gap-x-3 gap-y-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                >`
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
console.log('Added loop to hero animation');
