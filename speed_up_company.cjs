const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const targetBlobs = `{/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF66B2]/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-[#00F0FF]/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-[#FF66B2]/5 rounded-full blur-[120px]"
        />
      </div>`;

// There are actually two instances of this block in the file right now (one was duplicated from a bad replace earlier?)
// Wait! Select-String found it twice!
// Let's replace ALL instances of the old blobs with the new dynamic ones.

const newBlobs = `{/* Animated Background Blobs & Particles */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Fast Moving Glows */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF66B2]/15 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-[#00F0FF]/15 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, 30, 0], scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-[#FF66B2]/10 rounded-full blur-[100px]"
        />
        
        {/* Floating Particles (Company Theme) */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              backgroundColor: Math.random() > 0.5 ? '#FF66B2' : '#00F0FF',
              opacity: Math.random() * 0.4 + 0.1,
            }}
            animate={{
              y: ['100vh', '-10vh'],
              x: [0, Math.random() * 60 - 30, 0],
            }}
            transition={{
              y: {
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * -30,
              },
              x: {
                duration: Math.random() * 8 + 8,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          />
        ))}
      </div>`;

let lastIdx = 0;
while (true) {
    let startIdx = code.indexOf('{/* Animated Background Blobs */}', lastIdx);
    if (startIdx === -1) break;
    
    let endIdx = code.indexOf('</div>', startIdx);
    if (endIdx === -1) break;
    endIdx += '</div>'.length;
    
    code = code.substring(0, startIdx) + newBlobs + code.substring(endIdx);
    lastIdx = startIdx + newBlobs.length;
}

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log('Updated Company animations');
