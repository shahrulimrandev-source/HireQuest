import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loopKey, setLoopKey] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setLoopKey((prev: number) => prev + 1);
    }, 8000); // Loop every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // -- Text Animations (Fades out quickly)
  const textOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.15], [0, -100]);
  const textScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // -- Mockup Animations (Comes up, scales, then expands to full width)
  const mockupScale = useTransform(scrollYProgress, [0, 0.3], [0.85, 1]);
  const mockupY = useTransform(scrollYProgress, [0, 0.3], ["70%", "-50%"]);
  const mockupWidth = useTransform(scrollYProgress, [0.3, 0.5], ["90%", "100%"]);
  const mockupMaxWidth = useTransform(scrollYProgress, [0.3, 0.5], ["1200px", "100%"]);
  const mockupPadding = useTransform(scrollYProgress, [0.3, 0.5], ["16px", "0px"]);
  const mockupBorderRadius = useTransform(scrollYProgress, [0.3, 0.5], ["24px", "0px"]);
  const innerBorderRadius = useTransform(scrollYProgress, [0.3, 0.5], ["16px", "0px"]);

  // -- Overlay Text (Fades in over the expanded mockup)
  const overlayOpacity = useTransform(scrollYProgress, [0.5, 0.65], [0, 1]);
  const overlayY = useTransform(scrollYProgress, [0.5, 0.65], [50, 0]);

  // -- Mesh Background Parallax
  const meshY1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const meshY2 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <div className="flex-1 flex flex-col font-sans bg-[#f8fafc]">
      {/* Navbar with Glassmorphism */}
      <header className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="HireQuest" className="w-10 h-10 object-contain" />
            <span className="font-heading font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-[#22b3c1] to-slate-800 animate-text-shine">HireQuest</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
          </nav>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:inline-flex text-sm font-bold text-slate-600 hover:text-[#22b3c1] transition-colors px-4 py-2">
              Log in
            </Link>
            <Link to="/login?mode=register" className="bg-[#22b3c1] hover:bg-[#1d97a3] text-white px-6 py-2.5 rounded-[12px] transition-all font-bold text-sm shadow-md shadow-[#22b3c1]/30 hover:shadow-lg transform active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1" ref={containerRef}>
        
        {/* Scroll Container height 300vh for scroll duration */}
        <div className="h-[300vh] relative w-full">
          
          {/* Sticky Viewport Container */}
          <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-20">
            
            {/* Animated Background Mesh (Parallax) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute inset-0 bg-[#f8fafc]"></div>
              <motion.div 
                style={{ y: meshY1 }}
                className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full blur-[120px] bg-gradient-to-br from-[#22b3c1]/40 to-blue-400/40"
              />
              <motion.div 
                style={{ y: meshY2 }}
                className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full blur-[100px] bg-gradient-to-tr from-purple-400/30 to-[#22b3c1]/30"
              />
              {/* Grid Pattern overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZTRlNGEwIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwb2x5Z29uIHBvaW50cz0iMCAwIDQwIDAgNDAgNDAgMCA0MCIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
            </div>

            {/* CONTENT LAYERS */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
              
              {/* HERO TEXT */}
              <motion.div
                style={{ opacity: textOpacity, y: textY, scale: textScale }}
                className="absolute top-[10vh] md:top-[15vh] px-6 text-center w-full max-w-5xl mx-auto z-20 flex flex-col items-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 shadow-sm mb-6 md:mb-8">
                  <span className="flex h-2 w-2 rounded-full bg-[#22b3c1] animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">AI-Powered Job Matching</span>
                </div>
                
                <motion.h1 
                  key={loopKey}
                  className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-heading tracking-tight mb-6 md:mb-8 leading-[1.1] text-slate-800 flex flex-wrap justify-center gap-x-3 gap-y-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {["Find", "your"].map((word, wIdx) => (
                    <span key={`w1-${wIdx}`} className="inline-block whitespace-nowrap">
                      {word.split("").map((char, cIdx) => (
                        <motion.span key={`c1-${wIdx}-${cIdx}`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                  
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22b3c1] via-blue-600 to-[#22b3c1] animate-text-shine inline-flex whitespace-nowrap gap-x-3">
                    {["dream", "job"].map((word, wIdx) => (
                      <span key={`w2-${wIdx}`} className="inline-block whitespace-nowrap">
                        {word.split("").map((char, cIdx) => (
                          <motion.span key={`c2-${wIdx}-${cIdx}`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">
                            {char}
                          </motion.span>
                        ))}
                      </span>
                    ))}
                  </span>

                  {["in", "a", "single", "swipe."].map((word, wIdx) => (
                    <span key={`w3-${wIdx}`} className="inline-block whitespace-nowrap">
                      {word.split("").map((char, cIdx) => (
                        <motion.span key={`c3-${wIdx}-${cIdx}`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                </motion.h1>
                
                <p className="text-xl md:text-2xl text-slate-500 mb-8 md:mb-12 max-w-3xl leading-relaxed">
                  HireQuest revolutionizes hiring. Upload your profile once, and our AI instantly connects you with companies that need your exact skills.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
                  <Link to="/login?role=seeker&mode=register" className="w-full sm:w-auto text-lg px-8 py-3.5 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all shadow-xl shadow-slate-900/20">
                    I'm looking for a job
                  </Link>
                  <Link to="/login?role=company&mode=register" className="w-full sm:w-auto text-lg px-8 py-3.5 rounded-full bg-white text-slate-800 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-md">
                    I'm hiring talent
                  </Link>
                </div>
              </motion.div>

              {/* DASHBOARD MOCKUP */}
              <motion.div 
                style={{ 
                  x: "-50%",
                  y: mockupY, 
                  scale: mockupScale, 
                  width: mockupWidth,
                  maxWidth: mockupMaxWidth,
                  padding: mockupPadding,
                  borderRadius: mockupBorderRadius
                }}
                className="absolute top-1/2 left-1/2 shadow-2xl bg-white/60 backdrop-blur-xl border border-slate-200/50 flex flex-col z-30 overflow-hidden"
              >
                <motion.div 
                  style={{ borderRadius: innerBorderRadius }} 
                  className="w-full bg-slate-100 aspect-[16/9] relative border border-slate-200 flex items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#22b3c1]/10 to-blue-500/10"></div>
                  
                  {/* Fake UI Elements inside Mockup */}
                  <div className="w-full h-full flex flex-col p-4 md:p-8 relative z-10">
                    <div className="h-6 md:h-8 w-full border-b border-slate-200/50 flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
                      <div className="flex gap-1.5 md:gap-2">
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-400"></div>
                      </div>
                    </div>
                    <div className="flex gap-4 md:gap-8 flex-1">
                      <div className="w-1/4 h-full bg-white rounded-lg md:rounded-xl shadow-sm hidden md:block opacity-70"></div>
                      <div className="flex-1 h-full bg-white rounded-lg md:rounded-xl shadow-sm flex flex-col p-4 md:p-8 opacity-90">
                        <div className="w-3/4 h-4 md:h-8 bg-slate-100 rounded-md mb-2 md:mb-4"></div>
                        <div className="w-1/2 h-2 md:h-4 bg-slate-100 rounded-md mb-6 md:mb-12"></div>
                        <div className="w-full flex-1 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg md:rounded-xl"></div>
                      </div>
                    </div>
                  </div>

                  {/* Text Overlay inside Mockup when expanded */}
                  <motion.div 
                    style={{ opacity: overlayOpacity, y: overlayY }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center px-6"
                  >
                    <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tight mb-4 drop-shadow-2xl">
                      Welcome to the Future.
                    </h2>
                    <p className="text-xl md:text-3xl text-white/90 font-medium max-w-3xl drop-shadow-lg">
                      Immersive profiles, instantaneous matching, and an experience built entirely around you.
                    </p>
                    <Link to="/login?mode=register" className="mt-10 px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-100 transition-all shadow-xl transform hover:scale-105 active:scale-95">
                      Explore HireQuest
                    </Link>
                  </motion.div>

                </motion.div>
              </motion.div>
              
              {/* Decorative Floating UI Elements (Only visible early on) */}
              <motion.div 
                style={{ opacity: textOpacity }}
                className="absolute right-[5%] top-[25%] bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden xl:flex items-center gap-4 z-20"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">98%</div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Match Found</div>
                  <div className="text-xs text-slate-500">Senior React Developer</div>
                </div>
              </motion.div>
              
              <motion.div 
                style={{ opacity: textOpacity }}
                className="absolute left-[5%] bottom-[25%] bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden xl:flex items-center gap-4 z-20"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">✨</div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Resume Optimized</div>
                  <div className="text-xs text-slate-500">AI analysis complete</div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
