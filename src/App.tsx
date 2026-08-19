import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SeekerDashboard from './pages/SeekerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/seeker/*" element={<SeekerDashboard />} />
        <Route path="/company/*" element={<CompanyDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
