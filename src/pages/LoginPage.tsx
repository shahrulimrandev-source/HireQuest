import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'company' ? 'company' : 'seeker';
  const [role, setRole] = useState<'seeker' | 'company'>(initialRole as 'seeker' | 'company');
  const initialMode = searchParams.get('mode') === 'register' ? false : true;
  const [isLogin, setIsLogin] = useState(initialMode);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const skills = formData.get('skills') as string;

    if (!isLogin) {
      const confirmPassword = formData.get('confirmPassword') as string;
      if (password !== confirmPassword) {
        toast.error('Passwords do not match!');
        return;
      }
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password, role } : { email, password, role, name, skills };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(isLogin ? 'Logged in successfully' : 'Registered successfully');
        if (data.user.role === 'seeker') {
          navigate('/seeker');
        } else {
          navigate('/company');
        }
      } else {
        toast.error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error. Ensure backend is running.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] overflow-hidden">
      {/* Left side - Visuals */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-30 blur-[100px]"
            style={{ background: 'linear-gradient(to right, #22b3c1, #3b82f6)' }}
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              x: [0, -50, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] rounded-full opacity-20 blur-[120px]"
            style={{ background: 'linear-gradient(to right, #8b5cf6, #22b3c1)' }}
          />
        </div>

        <div className="relative z-10 flex items-center gap-3 mb-12">
          <img src="/logo.png" alt="HireQuest" className="w-12 h-12 object-contain" />
          <span className="font-heading font-bold text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#22b3c1] to-white animate-text-shine">HireQuest</span>
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                {role === 'seeker' ? "Your next career move awaits." : "Find the perfect candidate."}
              </h2>
              <p className="text-gray-300 text-xl leading-relaxed">
                {role === 'seeker' 
                  ? "Join thousands of professionals finding their dream jobs through our AI-powered matching system."
                  : "Access a curated pool of top talent and streamline your hiring process instantly."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <span>Trusted by forward-thinking teams worldwide</span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-12">
            <img src="/logo.png" alt="HireQuest" className="w-10 h-10 object-contain" />
            <span className="font-heading font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-[#22b3c1] to-slate-800 animate-text-shine">HireQuest</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold font-heading text-slate-800 mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500">
              {isLogin ? 'Enter your details to access your account.' : 'Sign up to get started with HireQuest.'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1 bg-slate-100/80 backdrop-blur-md rounded-[16px] w-full mb-8 border border-slate-200/50 shadow-inner">
            <button 
              type="button"
              className={`flex-1 py-3 text-sm font-bold rounded-[12px] transition-all duration-300 ${role === 'seeker' ? 'bg-white shadow-sm text-slate-800 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setRole('seeker')}
            >
              Job Seeker
            </button>
            <button 
              type="button"
              className={`flex-1 py-3 text-sm font-bold rounded-[12px] transition-all duration-300 ${role === 'company' ? 'bg-white shadow-sm text-slate-800 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setRole('company')}
            >
              Employer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block" htmlFor="name">Full Name or Company Name</label>
                    <input 
                      id="name" 
                      name="name"
                      type="text" 
                      minLength={2}
                      placeholder={role === 'seeker' ? "e.g. John Doe" : "e.g. Acme Corp"} 
                      className="w-full h-12 px-4 rounded-[12px] border border-slate-200 bg-white/50 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#22b3c1]/30 focus:border-[#22b3c1]"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block" htmlFor="skills">Key Skills or Keywords</label>
                    <input 
                      id="skills" 
                      name="skills"
                      type="text" 
                      placeholder={role === 'seeker' ? "React, Python, Design..." : "Looking for: Node.js, Sales..."} 
                      className="w-full h-12 px-4 rounded-[12px] border border-slate-200 bg-white/50 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#22b3c1]/30 focus:border-[#22b3c1]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block" htmlFor="email">Email Address</label>
              <input 
                id="email" 
                name="email"
                type="email" 
                placeholder="name@example.com" 
                className="w-full h-12 px-4 rounded-[12px] border border-slate-200 bg-white/50 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#22b3c1]/30 focus:border-[#22b3c1]"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block" htmlFor="password">Password</label>
                {isLogin && <a href="#" className="text-xs font-bold text-[#22b3c1] hover:text-[#1d97a3] transition-colors">Forgot password?</a>}
              </div>
              <input 
                id="password" 
                name="password"
                type="password" 
                minLength={6}
                placeholder="••••••••" 
                className="w-full h-12 px-4 rounded-[12px] border border-slate-200 bg-white/50 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#22b3c1]/30 focus:border-[#22b3c1]"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  minLength={6}
                  placeholder="••••••••" 
                  className="w-full h-12 px-4 rounded-[12px] border border-slate-200 bg-white/50 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#22b3c1]/30 focus:border-[#22b3c1]"
                  required
                />
              </div>
            )}

            <button 
              type="submit" 
              className="w-full h-12 mt-4 bg-gradient-to-r from-[#22b3c1] to-[#1d97a3] hover:from-[#1d97a3] hover:to-[#17828d] text-white font-bold rounded-[12px] transition-all transform active:scale-[0.98] shadow-lg shadow-[#22b3c1]/30 flex items-center justify-center gap-2 text-base"
            >
              {isLogin ? 'Sign In to Dashboard' : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-[#22b3c1] font-bold hover:underline transition-all"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
