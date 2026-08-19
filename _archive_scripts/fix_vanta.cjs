const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const startIdx = code.indexOf('  useEffect(() => {\n    // @ts-ignore\n    if (!vantaEffect');
const endIdx = code.indexOf('  }, [vantaEffect]);', startIdx) + '  }, [vantaEffect]);'.length;

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find target strings.");
  process.exit(1);
}

const replacement = `  useEffect(() => {
    let effect: any = null;
    
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initVanta = async () => {
      try {
        // @ts-ignore
        if (!window.THREE) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        // @ts-ignore
        if (!window.VANTA) await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js');
        
        // @ts-ignore
        if (vantaRef.current && window.VANTA && !vantaEffect) {
          // @ts-ignore
          effect = window.VANTA.GLOBE({
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
          });
          setVantaEffect(effect);
        }
      } catch (err) {
        console.error("Failed to load Vanta", err);
      }
    };

    initVanta();

    return () => {
      if (effect) effect.destroy();
    };
  }, []);`;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log('Fixed Vanta loading.');
