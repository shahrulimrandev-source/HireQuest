const fs = require('fs');

// 1. Get the original lines
let original = fs.readFileSync('original_lines.txt', 'utf8').split('\n');

// 2. Add the Vanta states
let stateInsertIndex = original.findIndex(line => line.includes("const navigate = useNavigate();"));
original.splice(stateInsertIndex, 0, "  const vantaRef = useRef<HTMLDivElement>(null);\n  const [vantaEffect, setVantaEffect] = useState<any>(null);");

// 3. Add the Vanta useEffect using CDN
let useEffectInsertIndex = original.findIndex(line => line.includes("const [user, setUser] = useState(JSON.parse"));
original.splice(useEffectInsertIndex, 0, `  useEffect(() => {
    // @ts-ignore
    if (!vantaEffect && vantaRef.current && window.VANTA) {
      // @ts-ignore
      setVantaEffect(window.VANTA.GLOBE({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xff66b2,
        color2: 0x00f0ff,
        size: 1.00,
        backgroundColor: 0x030213
      }));
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);
`);

// 4. Replace framer-motion in the return statement
let returnIndex = original.findIndex(line => line.includes('<div className="theme-company min-h-screen'));
let cropModalIndex = original.findIndex(line => line.includes('{/* Crop Modal */}'));
original.splice(returnIndex + 1, cropModalIndex - returnIndex - 1, `      {/* Vanta Animated Background */}
      <div ref={vantaRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-60"></div>
      `);

// 5. Get the rest of the file from CURRENT CompanyDashboard.tsx
let current = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8').split('\n');
let currentCropModalIndex = current.findIndex(line => line.includes('{/* Crop Modal */}'));
let restOfFile = current.slice(currentCropModalIndex + 1).join('\n');

// 6. Write the final file
// Make sure to cleanly join original lines
let finalOriginal = original.slice(0, original.findIndex(line => line.includes('{/* Crop Modal */}')) + 1).join('\n');
let finalCode = finalOriginal + '\n' + restOfFile;
fs.writeFileSync('src/pages/CompanyDashboard.tsx', finalCode);
console.log('Restoration complete.');
