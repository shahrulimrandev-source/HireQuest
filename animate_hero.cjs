const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const oldHero = `<h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-heading tracking-tight mb-6 md:mb-8 leading-[1.1] text-slate-800">
                  Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22b3c1] via-blue-600 to-[#22b3c1] animate-text-shine">dream job</span> in a single swipe.
                </h1>`;

const newHero = `<motion.h1 
                  className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-heading tracking-tight mb-6 md:mb-8 leading-[1.1] text-slate-800"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {"Find your ".split("").map((char, index) => (
                    <motion.span key={\`t1-\${index}\`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">
                      {char === " " ? "\\u00A0" : char}
                    </motion.span>
                  ))}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22b3c1] via-blue-600 to-[#22b3c1] animate-text-shine inline-block whitespace-nowrap">
                    {"dream job".split("").map((char, index) => (
                      <motion.span key={\`t2-\${index}\`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">
                        {char === " " ? "\\u00A0" : char}
                      </motion.span>
                    ))}
                  </span>
                  {" in a single swipe.".split("").map((char, index) => (
                    <motion.span key={\`t3-\${index}\`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">
                      {char === " " ? "\\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.h1>`;

if (code.includes(oldHero)) {
  code = code.replace(oldHero, newHero);
  fs.writeFileSync('src/pages/LandingPage.tsx', code);
  console.log('Hero animated');
} else {
  console.log('Old hero not found!');
}
