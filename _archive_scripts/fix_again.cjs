const fs = require('fs');

// 1. Get original lines (which has lines 1-210)
let original = fs.readFileSync('original_lines.txt', 'utf8').split('\n');
let cropModalIndex = original.findIndex(line => line.includes('{/* Crop Modal */}'));
let finalOriginal = original.slice(0, cropModalIndex + 1).join('\n');

// 2. We need the rest of the file from a clean source
// I will just use git checkout to restore CompanyDashboard to before this mess! Wait, I don't have git history of my immediate changes.
// But earlier, before I ran `replace_file_content`, I ran `make_transparent.cjs`. That worked perfectly and the file was clean!
// Where is a clean version?
// I can just read the current file, and remove the duplicated chunk that replace_file_content added!
let current = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// The replace_file_content replaced:
// <div className="theme-company min-h-screen bg-background text-foreground flex flex-col h-screen overflow-hidden relative">
// with a massive chunk of duplicate functions starting with `try { const response = await fetch('/api/applications'`
// and ending with `<div className="theme-company min-h-screen bg-[#030213] text-foreground flex flex-col h-screen overflow-hidden relative">`

// Let's just find the first occurrence of:
// `  return (\n    <div className="theme-company min-h-screen bg-[#030213] text-foreground flex flex-col h-screen overflow-hidden relative">`
// Wait! `replace_file_content` replaced line 629 to 638.
// Let's just use `indexOf('  return (\n    <div className="theme-company min-h-screen bg-[#030213]')`.

const goodReturnIdx = current.lastIndexOf('  return (\n    <div className="theme-company min-h-screen bg-[#030213] text-foreground flex flex-col h-screen overflow-hidden relative">');

if (goodReturnIdx !== -1) {
    // The functions before `handleCreateJob` should be kept.
    // The duplicated functions start somewhere above.
    // Let's just find `  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {` that comes right BEFORE `goodReturnIdx`!
    
    // Actually, it's easier to just reconstruct from original_lines.txt + a clean suffix.
    // Where is a clean suffix? `original_lines.txt` contains up to `Crop Modal`.
    // The rest of the file was intact in `current` AFTER the second `Crop Modal`.
    
    const cropModalIdx = current.lastIndexOf('{/* Crop Modal */}');
    const suffix = current.substring(cropModalIdx + '{/* Crop Modal */}'.length);
    
    // finalOriginal already has up to `{/* Crop Modal */}` from `original_lines.txt`
    // but we need the framer-motion blobs in `finalOriginal`!
    
    // Wait, original_lines.txt has:
    // `<div className="theme-company min-h-screen bg-background...`
    // I will replace it with `bg-[#030213]`.
    finalOriginal = finalOriginal.replace('bg-background', 'bg-[#030213]');
    
    // And insert framer-motion blobs before `{/* Crop Modal */}`
    const blobs = `
      {/* Animated Background Blobs */}
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
      </div>
    `;
    
    finalOriginal = finalOriginal.replace('{/* Crop Modal */}', blobs + '\n      {/* Crop Modal */}');
    
    let finalCode = finalOriginal + suffix;
    
    // Now apply transparency
    finalCode = finalCode.replace(/className="(w-full h-full overflow-y-auto[^"]*) bg-\[#030213\]/g, 'className="$1 bg-transparent');
    finalCode = finalCode.replace(/className={\`flex-1 flex overflow-hidden relative w-full h-full bg-\[#030213\]/g, 'className={`flex-1 flex overflow-hidden relative w-full h-full bg-transparent');
    finalCode = finalCode.replace(/className="relative w-full overflow-hidden bg-\[#030213\]/g, 'className="relative w-full overflow-hidden bg-transparent');
    finalCode = finalCode.replace(/className="flex-1 overflow-y-auto ([^"]*) bg-\[#030213\]/g, 'className="flex-1 overflow-y-auto $1 bg-transparent');
    finalCode = finalCode.replace(/className="w-full h-full bg-\[#030213\] overflow-y-auto/g, 'className="w-full h-full bg-transparent overflow-y-auto');

    fs.writeFileSync('src/pages/CompanyDashboard.tsx', finalCode);
    console.log('Restored fully cleanly.');
} else {
    console.log('Could not find goodReturnIdx');
}
