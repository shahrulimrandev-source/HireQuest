const fs = require('fs');

let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const oldHeroRegex = /<motion\.h1[^>]*>[\s\S]*?<\/motion\.h1>/;

const newHero = `<motion.h1 
                  className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-heading tracking-tight mb-6 md:mb-8 leading-[1.1] text-slate-800 flex flex-wrap justify-center gap-x-3 gap-y-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {["Find", "your"].map((word, wIdx) => (
                    <span key={\`w1-\${wIdx}\`} className="inline-block whitespace-nowrap">
                      {word.split("").map((char, cIdx) => (
                        <motion.span key={\`c1-\${wIdx}-\${cIdx}\`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                  
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22b3c1] via-blue-600 to-[#22b3c1] animate-text-shine inline-flex whitespace-nowrap gap-x-3">
                    {["dream", "job"].map((word, wIdx) => (
                      <span key={\`w2-\${wIdx}\`} className="inline-block whitespace-nowrap">
                        {word.split("").map((char, cIdx) => (
                          <motion.span key={\`c2-\${wIdx}-\${cIdx}\`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">
                            {char}
                          </motion.span>
                        ))}
                      </span>
                    ))}
                  </span>

                  {["in", "a", "single", "swipe."].map((word, wIdx) => (
                    <span key={\`w3-\${wIdx}\`} className="inline-block whitespace-nowrap">
                      {word.split("").map((char, cIdx) => (
                        <motion.span key={\`c3-\${wIdx}-\${cIdx}\`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                </motion.h1>`;

if (oldHeroRegex.test(code)) {
  code = code.replace(oldHeroRegex, newHero);
  fs.writeFileSync('src/pages/LandingPage.tsx', code);
  console.log('Fixed hero text wrapping');
} else {
  console.log('Could not find motion.h1');
}
