import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Search, Filter, X, Briefcase, MapPin, Building, DollarSign, Clock, CheckCircle, ChevronRight, MessageSquare, LogOut, FileText, Upload, Calendar, Zap, RefreshCw, Trophy, Target, Globe, Phone, Mail, Award, Edit, Image, Loader2, Bookmark, Linkedin, Send, GraduationCap, Image as ImageIcon, Trash2, FileCheck } from 'lucide-react';
import CandidateFeedBlock from '../components/shared/CandidateFeedBlock';
import EmailComposeModal from '../components/shared/EmailComposeModal';
import { useNavigate } from 'react-router-dom';
import CompanyFeedBlock from '../components/shared/CompanyFeedBlock';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';
import confetti from 'canvas-confetti';

const COLORS = [
  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'bg-pink-500/10 text-pink-400 border-pink-500/30',
  'bg-green-500/10 text-green-400 border-green-500/30',
  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'bg-red-500/10 text-red-400 border-red-500/30',
  'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  'bg-teal-500/10 text-teal-400 border-teal-500/30',
  'bg-orange-500/10 text-orange-400 border-orange-500/30'
];

const getSkillColor = (skill: string) => {
  let hash = 0;
  for (let i = 0; i < skill.length; i++) {
    hash = skill.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

export default function SeekerDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailModalData, setEmailModalData] = useState<{email: string, subject: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'discover'|'applications'|'interviews'|'profile'|'rankings'|'matches'>('discover');
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const navigate = useNavigate();
  const discoverScrollRef = useRef<HTMLDivElement>(null);

  const groupedJobs = useMemo(() => {
    const groups: Record<number, { company_id: number, companyName: string, companyLogo: string, posts: any[], jobs: any[] }> = {};
    jobs.forEach(item => {
      if (!groups[item.company_id]) {
        groups[item.company_id] = {
          company_id: item.company_id,
          companyName: item.companyName,
          companyLogo: item.companyLogo,
          posts: [],
          jobs: []
        };
      }
      if (item.item_type === 'post') {
        groups[item.company_id].posts.push(item);
      } else {
        groups[item.company_id].jobs.push(item);
      }
    });

    const groupsArray = Object.values(groups);
    
    // Sort posts within each group by created_at (newest first)
    groupsArray.forEach(group => {
      group.posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });

    // Sort groups by the newest post among them
    groupsArray.sort((a, b) => {
      const aNewest = a.posts.length > 0 ? new Date(a.posts[0].created_at).getTime() : 0;
      const bNewest = b.posts.length > 0 ? new Date(b.posts[0].created_at).getTime() : 0;
      return bNewest - aNewest;
    });

    return groupsArray;
  }, [jobs]);
  
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const [aiLanguage, setAiLanguage] = useState<'ms' | 'en'>(() => {
    return (localStorage.getItem('aiLanguage') as 'ms' | 'en') || 'ms';
  });

  useEffect(() => {
    localStorage.setItem('aiLanguage', aiLanguage);
  }, [aiLanguage]);

  const [aiReason, setAiReason] = useState<string | null>(null);
  const [isFetchingReason, setIsFetchingReason] = useState(false);
  const [aiLearningRec, setAiLearningRec] = useState<any | null>(null);
  const [isFetchingLearningRec, setIsFetchingLearningRec] = useState(false);

  const fetchAiLearningRec = async (jobId: number) => {
    try {
      setIsFetchingLearningRec(true);
      const res = await fetch('/api/ai/learning-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seekerId: user.id, jobId, lang: aiLanguage })
      });
      const data = await res.json();
      if (data.success) {
        setAiLearningRec(data.recommendation);
      } else {
        toast.error(data.message || (aiLanguage === 'en' ? 'Failed to get learning recommendations.' : 'Gagal mendapatkan cadangan pembelajaran.'));
      }
    } catch (e) {
      toast.error(aiLanguage === 'en' ? 'System error.' : 'Ralat sistem.');
    } finally {
      setIsFetchingLearningRec(false);
    }
  };
  const [selectedJobModal, setSelectedJobModal] = useState<any | null>(null);
  const [selectedPostModal, setSelectedPostModal] = useState<any | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  
  const [viewingCompanyId, setViewingCompanyId] = useState<number | null>(null);
  const [viewingCompanyData, setViewingCompanyData] = useState<any | null>(null);
  const [isFetchingCompany, setIsFetchingCompany] = useState(false);

  // Interview States
  const [interviews, setInterviews] = useState<any[]>([]);

  // Certificates State
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [selectedResumeName, setSelectedResumeName] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`/api/seeker/certificates/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setCertificates(data.certificates);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploadingCert(true);
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('seekerId', user.id);
    
    try {
      toast.info('Scanning certificate with AI...', { duration: 4000 });
      const res = await fetch('/api/seeker/certificates/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Certificate scanned and uploaded successfully!');
        fetchCertificates();
      } else {
        toast.error(data.message || 'Failed to upload certificate');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error uploading certificate');
    } finally {
      setIsUploadingCert(false);
      e.target.value = ''; // clear input
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    try {
      const res = await fetch(`/api/seeker/certificates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Certificate deleted');
        fetchCertificates();
      }
    } catch (e) {
      toast.error('Error deleting certificate');
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await fetch(`/api/interviews/seeker/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewCompany = async (companyId: number) => {
    setViewingCompanyId(companyId);
    setViewingCompanyData(null);
    setIsFetchingCompany(true);
    try {
      const res = await fetch(`/api/users/${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setViewingCompanyData(data);
      } else {
        toast.error('Failed to load company profile');
        setViewingCompanyId(null);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error loading company profile');
      setViewingCompanyId(null);
    } finally {
      setIsFetchingCompany(false);
    }
  };

  const [chatModalApplication, setChatModalApplication] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const openChat = async (app: any) => {
    setChatModalApplication(app);
    try {
      // Mark as read
      await fetch(`/api/messages/read/${app.id}/${user.id}`, { method: 'PUT' });
      // Update local state to clear unread indicator
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, unreadCount: 0 } : a));
      
      const res = await fetch(`/api/messages/${app.id}`);
      const data = await res.json();
      setChatMessages(data);
    } catch (e) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatModalApplication) return;
    setIsSendingMsg(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: chatModalApplication.id,
          sender_id: user.id,
          receiver_id: chatModalApplication.company_id,
          content: newMessage
        })
      });
      if (res.ok) {
        setNewMessage('');
        const msgRes = await fetch(`/api/messages/${chatModalApplication.id}`);
        const msgData = await msgRes.json();
        setChatMessages(msgData);
        fetchApplications();
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setIsSendingMsg(false);
    }
  };


  const fetchAiReason = async (jobId: number) => {
    setIsFetchingReason(true);
    try {
      const res = await fetch('/api/ai/match-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seekerId: user.id, jobId, lang: aiLanguage })
      });
      const data = await res.json();
      if (data.success) {
        setAiReason(data.reason);
      } else {
        toast.error(aiLanguage === 'en' ? 'Failed to get AI reason.' : 'Gagal mendapatkan ulasan AI.');
      }
    } catch (error) {
      console.error(error);
      toast.error(aiLanguage === 'en' ? 'Error fetching AI reason.' : 'Ralat mendapatkan ulasan AI.');
    } finally {
      setIsFetchingReason(false);
    }
  };
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    linkedin_link: user?.linkedin_link || '',
    skills: user?.skills || '',
    bio: user?.bio || '',
    education_level: user?.education_level || '',
    location: user?.location || ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      linkedin_link: user.linkedin_link || '',
      skills: user.skills || '',
      bio: user.bio || '',
      education_level: user.education_level || '',
      location: user.location || ''
    });
  }, [user]);
  // Job Details State
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const confirmCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (croppedImage) {
        setCroppedImageBlob(croppedImage);
        setCropModalOpen(false);
        toast.success("Profile picture cropped and ready to save!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image.");
    }
  };

  useEffect(() => {
    if (!user.id || user.role !== 'seeker') {
      navigate('/login');
      return;
    }
    if (activeTab === 'discover' || activeTab === 'rankings') fetchJobs();
    else if (activeTab === 'applications' || activeTab === 'matches') fetchApplications();
    else if (activeTab === 'interviews') fetchInterviews();
    else if (activeTab === 'profile') fetchCertificates();
  }, [user.id, activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/feed?seekerId=${user.id}`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchJobs();
      return;
    }
    setLoading(true);
    setIsSearching(true);
    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, seekerId: user.id })
      });
      const data = await response.json();
      if (response.ok) {
        setJobs(data);
        if (data.length === 0) toast.info('No relevant jobs found for that search.');
      } else {
        toast.error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Search error');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/applications/seeker/${user.id}`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const applyForJob = async (jobId: number, message?: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, seeker_id: user.id, message })
      });
      const data = await response.json();
      if (!data.success && data.message === 'Already applied') {
        toast.info('You have already applied for this job');
      } else if (data.success) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('Application submitted successfully!');
        setSelectedJobModal(null);
        setApplyMessage('');
      } else {
        toast.error('Failed to apply');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error');
    }
  };

  const updateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a));
        toast.success(status === 'accepted' ? 'Invitation accepted!' : 'Invitation declined');
      } else {
        toast.error('Failed to update status');
      }
      fetchApplications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelApplication = async (applicationId: number) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to cancel this application?',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/applications/${applicationId}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            toast.success('Application cancelled');
            setApplications(prev => prev.filter(app => app.id !== applicationId));
          } else {
            toast.error('Failed to cancel application');
          }
        } catch (error) {
          console.error(error);
          toast.error('Server error');
        }
      }
    });
  };

  const handleSwipeRight = (job: any) => {
    setSelectedJobModal(job);
  };

  const handleApplyConfirm = () => {
    if (selectedJobModal) {
      applyForJob(selectedJobModal.id, applyMessage);
      setJobs(prev => prev.filter(j => j.id !== selectedJobModal.id));
    }
  };

  const handleSwipeLeft = (job: any) => {
    setJobs(prev => prev.filter(j => j.id !== job.id));
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Extract form data BEFORE any await calls, because React nullifies e.currentTarget
    const formData = new FormData(e.currentTarget);
    const banner = formData.get('banner') as File;
    const resume = formData.get('resume') as File;
    const certificate = formData.get('certificate') as File;

    if (croppedImageBlob) {
      formData.set('profile_picture', croppedImageBlob, 'profile_pic.jpg');
    }
    const profilePic = formData.get('profile_picture') as File;

    try {
      // 1. Update text data
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) throw new Error('Failed to update text profile');
      
      let updatedUser = { ...user, ...profileData };

      // 2. Upload files
      if ((profilePic && profilePic.size > 0) || (banner && banner.size > 0) || (resume && resume.size > 0) || (certificate && certificate.size > 0)) {
        toast.info('Uploading files...', { id: 'uploading' });
        const fileRes = await fetch(`/api/users/${user.id}/uploads`, {
          method: 'POST',
          body: formData
        });
        const fileData = await fileRes.json();
        if (fileData.success) {
          updatedUser = fileData.user;
          toast.success('Files uploaded successfully!', { id: 'uploading' });
          if (fileData.extractedSkills && fileData.extractedSkills.length > 0) {
            toast.success(`OCR Extracted ${fileData.extractedSkills.length} new skills: ${fileData.extractedSkills.join(', ')}`, { duration: 5000 });
          }
          if (fileData.extractedBio) {
            toast.success(`OCR Extracted a new Professional Bio from your document!`, { duration: 5000 });
          }
        } else {
          toast.error('File upload failed', { id: 'uploading' });
        }
      }

      toast.success('Profile saved!');
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCroppedImageBlob(null); // Reset crop after save
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(`Error saving: ${error.message || 'Server error'}`);
    } finally {
      setIsEditingProfile(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete account');
          
          toast.success('Account deleted successfully');
          localStorage.removeItem('user');
          navigate('/');
        } catch (error: any) {
          toast.error(`Error deleting account: ${error.message}`);
        }
      }
    });
  };

  const handleRemoveFile = async (fileType: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to remove this file?',
      onConfirm: async () => {
        try {
          toast.info('Removing file...', { id: 'removing' });
          const res = await fetch(`/api/users/${user.id}/uploads/${fileType}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to remove file');
          
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast.success('File removed', { id: 'removing' });
        } catch (error: any) {
          toast.error(`Error removing file: ${error.message}`, { id: 'removing' });
        }
      }
    });
  };

  return (
    <div className="theme-seeker min-h-screen bg-[#0B1120] text-foreground flex flex-col h-screen overflow-hidden relative">
      {/* Floating Tech Particles + Aurora */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-[-20%] left-[-10%] right-[-10%] h-[60%] bg-[#00F0FF]/10 blur-[150px] rounded-full" />
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[40%] bg-[#3B82F6]/10 blur-[150px] rounded-full" />
        
        {/* Floating Data Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-[#00F0FF] rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              y: ['100vh', '-10vh'],
              x: [0, Math.random() * 50 - 25, 0],
            }}
            transition={{
              y: {
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * -30,
              },
              x: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          />
        ))}
      </div>
      
      {/* Job Application Modal */}
      <AnimatePresence>
        {selectedJobModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#111827] w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-700 text-white">
              <h2 className="text-xl font-bold mb-4">Apply for {selectedJobModal.title}</h2>
              <p className="text-gray-300 mb-4">Add a message to the hiring team (optional):</p>
              <textarea 
                className="w-full h-32 p-3 rounded-lg border border-gray-700 bg-[#0B1120] text-white placeholder-gray-500 mb-4"
                placeholder="Why are you a good fit?"
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={() => setSelectedJobModal(null)} className="flex-1 py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-800 transition-colors">Cancel</button>
                <button onClick={handleApplyConfirm} className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">Submit Application</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0B1120] border-[#1E293B] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col relative border text-white">
              <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
                <X size={20} />
              </button>

              <div className="flex-1 overflow-y-auto">
                {/* Job Details View */}
                <div>
                  <div className="h-32 relative bg-cover bg-center" style={selectedJob.companyBanner ? { backgroundImage: `url(${selectedJob.companyBanner.startsWith('http') ? selectedJob.companyBanner : `http://localhost:5000${selectedJob.companyBanner}`})` } : { backgroundImage: 'linear-gradient(to right, #3b82f6, #4f46e5)' }}>
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                  <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -mt-10 mb-6">
                      <div className="w-20 h-20 bg-white dark:bg-card rounded-xl shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-background uppercase overflow-hidden z-10">
                        {selectedJob.companyLogo ? (
                          <img src={selectedJob.companyLogo.startsWith('http') ? selectedJob.companyLogo : `http://localhost:5000${selectedJob.companyLogo}`} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                          selectedJob.companyName ? selectedJob.companyName.charAt(0) : 'C'
                        )}
                      </div>
                      {selectedJob.matchScore !== undefined && (
                        <div className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1.5 rounded-full font-bold text-sm border border-blue-200 dark:border-blue-800 text-outline">
                          {selectedJob.matchScore}% Match
                        </div>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold font-heading mb-1">{selectedJob.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <p className="text-lg text-muted-foreground font-medium">{selectedJob.companyName}</p>
                      {selectedJob.matchScore !== undefined && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button onClick={() => fetchAiReason(selectedJob.id)} disabled={isFetchingReason} className="px-3 py-1.5 bg-gradient-to-r from-[#22b3c1] to-[#1d97a3] text-white rounded-[23px] text-sm font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2">
                            ✨ {isFetchingReason ? (aiLanguage === 'en' ? 'Asking AI...' : 'Tanya AI...') : (aiLanguage === 'en' ? 'Ask AI Why I Match?' : 'Tanya AI Kenapa Saya Sesuai?')}
                          </button>
                          <button onClick={() => fetchAiLearningRec(selectedJob.id)} disabled={isFetchingLearningRec} className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-bold shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2">
                            🎓 {isFetchingLearningRec ? (aiLanguage === 'en' ? 'Analyzing...' : 'Menganalisis...') : (aiLanguage === 'en' ? 'AI Learning Recommendation' : 'Cadangan Pembelajaran AI')}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {aiReason && (
                      <div className="mb-6 p-4 bg-[#22b3c1]/10 border border-[#22b3c1]/20 rounded-[15px] relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#22b3c1]"></div>
                        <h4 className="font-bold text-[#22b3c1] mb-1 flex items-center gap-1.5 text-sm">✨ {aiLanguage === 'en' ? 'AI Insights' : 'Pandangan AI'}</h4>
                        <p className="text-sm font-medium leading-relaxed italic text-white">{aiReason}</p>
                      </div>
                    )}

                    {aiLearningRec && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-200 to-emerald-300 dark:from-emerald-300 dark:to-emerald-400 border border-emerald-400 rounded-xl relative overflow-hidden shadow-md">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
                        <h4 className="font-bold text-black mb-2 flex items-center gap-1.5 text-sm">🎓 AI Learning Recommendation</h4>
                        {typeof aiLearningRec === 'string' ? (
                          <p className="text-sm font-semibold leading-relaxed text-black whitespace-pre-wrap">{aiLearningRec}</p>
                        ) : (
                          <>
                            <div className="mb-3 bg-red-50/50 p-2.5 rounded-lg border border-red-200/50">
                              <h5 className="font-bold text-red-700 text-xs uppercase tracking-wider mb-1">{aiLanguage === 'en' ? 'Missing Skills' : 'Kemahiran Yang Kurang'}</h5>
                              <p className="text-sm font-bold leading-relaxed text-red-600 whitespace-pre-wrap">{aiLearningRec.missingSkills}</p>
                            </div>
                            <div className="p-2.5">
                              <h5 className="font-bold text-black text-xs uppercase tracking-wider mb-1">{aiLanguage === 'en' ? 'Learning Recommendations' : 'Cadangan Pembelajaran'}</h5>
                              <p className="text-sm font-semibold leading-relaxed text-black whitespace-pre-wrap">{aiLearningRec.learningRecommendations}</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-800/50"><MapPin size={16} /> {selectedJob.location}</span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium border border-green-100 dark:border-green-800/50"><DollarSign size={16} /> {selectedJob.salary}</span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium border border-purple-100 dark:border-purple-800/50"><Briefcase size={16} /> {selectedJob.type}</span>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold text-lg mb-2 border-b border-[#1E293B] pb-2 text-white">About the Role</h3>
                        <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-300">{selectedJob.description}</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 border-b border-[#1E293B] pb-2 text-white">Requirements</h3>
                        <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-300">{selectedJob.requirements}</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 border-b border-[#1E293B] pb-2 text-white">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills.split(',').map((skill: string, i: number) => (
                            <span key={i} className={`px-3 py-1.5 ${getSkillColor(skill.trim())} rounded-lg text-xs font-bold uppercase tracking-widest`}>{skill.trim()}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-800 bg-[#0B1120] flex gap-3 rounded-b-[30px]">
                <button 
                  onClick={() => handleViewCompany(selectedJob.company_id)}
                  disabled={isFetchingCompany}
                  className="flex-1 py-3 rounded-[23px] border-2 border-gray-600 text-white font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  {isFetchingCompany ? 'Loading...' : <><Building size={18}/> View Company Profile</>}
                </button>
                <button 
                  onClick={() => { handleSwipeRight(selectedJob); setSelectedJob(null); }}
                  className="flex-1 py-3 rounded-[23px] bg-[#22b3c1] text-white font-bold text-lg shadow-md hover:bg-[#1d97a3] transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Crop Modal */}
      <AnimatePresence>
        {cropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                <h3 className="font-bold text-lg">Crop Profile Picture</h3>
                <button onClick={() => setCropModalOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="relative w-full h-80 bg-black">
                {imageToCrop && (
                  <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="round"
                    showGrid={false}
                  />
                )}
              </div>
              <div className="p-4 bg-muted/30 border-t">
                <div className="mb-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Zoom</label>
                  <input 
                    type="range" 
                    value={zoom} 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    onChange={(e) => setZoom(Number(e.target.value))} 
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCropModalOpen(false)} className="flex-1 py-2 rounded-lg border font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={confirmCrop} className="flex-1 py-2 rounded-lg bg-[#22b3c1] text-white font-medium hover:bg-[#1d97a3] transition-colors">Apply Crop</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-20 px-4 md:px-8 bg-[#0B1120] border-b border-[#1E293B] flex items-center justify-between shadow-md shrink-0 relative z-30">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="HireQuest" className="w-10 h-10 object-contain filter drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
          <span className="font-heading font-bold text-2xl hidden lg:block tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00F0FF] to-white animate-text-shine">HireQuest</span> <span className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-2.5 py-1 rounded-sm ml-2 tracking-widest uppercase text-white">Job Seeker</span></span>
        </div>
        <nav className="flex items-center gap-2 p-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button onClick={() => setActiveTab('discover')} className={`px-5 py-2.5 text-sm font-bold rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'discover' ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'text-gray-400 hover:text-white border border-transparent hover:bg-white/5'}`}>✨ For You</button>
          <button onClick={() => setActiveTab('rankings')} className={`px-5 py-2.5 text-sm font-bold rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'rankings' ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'text-gray-400 hover:text-white border border-transparent hover:bg-white/5'}`}>📈 Top Matches</button>
          <button onClick={() => setActiveTab('matches')} className={`relative px-5 py-2.5 text-sm font-bold rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'matches' ? 'bg-green-500/10 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'text-gray-400 hover:text-white border border-transparent hover:bg-white/5'}`}>
            🎯 Matches
            {applications.some(a => a.status === 'accepted' && a.unreadCount > 0) && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
          </button>
          <button onClick={() => setActiveTab('applications')} className={`relative px-5 py-2.5 text-sm font-bold rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'applications' ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'text-gray-400 hover:text-white border border-transparent hover:bg-white/5'}`}>
            📋 Applications
            {applications.some(a => a.status === 'pending' && a.message) && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
          </button>
          <button onClick={() => setActiveTab('interviews')} className={`px-5 py-2.5 text-sm font-bold rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'interviews' ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'text-gray-400 hover:text-white border border-transparent hover:bg-white/5'}`}>💬 Interviews</button>
          <button onClick={() => setActiveTab('profile')} className={`px-5 py-2.5 text-sm font-bold rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'profile' ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'text-gray-400 hover:text-white border border-transparent hover:bg-white/5'}`}>👤 Profile</button>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={handleSignOut} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-white border border-[#1E293B] rounded-md hover:bg-white/5 transition-colors">
            Sign Out
          </button>
          <div className="w-10 h-10 shrink-0 bg-[#111827] rounded-md flex items-center justify-center text-[#00F0FF] font-bold uppercase overflow-hidden border border-[#1E293B] cursor-pointer shadow-sm hover:border-[#00F0FF] transition-all" onClick={() => setActiveTab('profile')}>
            {user.profile_picture ? (
              <img src={user.profile_picture?.startsWith('http') ? user.profile_picture : `http://localhost:5000${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.name ? user.name.substring(0, 2) : 'ME'
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 flex overflow-hidden relative w-full h-full bg-transparent`}>
        {activeTab === 'discover' && (
          <div ref={discoverScrollRef} className="w-full h-[80vh] overflow-y-auto pb-20 space-y-0 scrollbar-thin">
              {/* WOOX STYLE HERO BANNER */}
              <div className="relative w-full overflow-hidden bg-transparent cyber-grid border-b border-[#1E293B] text-white mb-8">
                <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/5 to-transparent"></div>
                <div className="relative p-10 md:p-16 flex flex-col items-center justify-center text-center">
                  <h2 className="text-xs md:text-sm font-bold mb-3 tracking-[0.2em] text-[#00F0FF] uppercase neon-text">Discover</h2>
                  <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter text-white">FIND YOUR DREAM JOB</h1>
                  <p className="text-[#94A3B8] max-w-2xl text-sm md:text-base font-medium mb-10">AI-matched opportunities ranked by fit for your unique skills.</p>
                  
                  {/* AI SEARCH BAR */}
                  <div className="w-full max-w-2xl bg-[#111827] border border-[#1E293B] p-2 rounded-xl shadow-2xl flex gap-2 items-center relative overflow-hidden group hover:border-[#00F0FF]/50 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex-1 px-4 py-2 flex items-center gap-3 relative z-10">
                      <Search className="text-[#00F0FF] shrink-0" size={20} />
                      <input 
                        type="text" 
                        placeholder="Ask AI to find a job..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-transparent border-none outline-none text-sm md:text-base font-medium text-white placeholder-gray-500"
                      />
                      {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); fetchJobs(); }} className="text-gray-400 hover:text-white transition-colors">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <button onClick={handleSearch} disabled={isSearching} className="bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 px-6 md:px-8 py-3 rounded-lg transition-all font-bold text-sm uppercase tracking-wider shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.1)] relative z-10">
                      {isSearching ? <Loader2 className="animate-spin" size={20} /> : "Search"}
                    </button>
                  </div>
                </div>
              </div>

              {!loading && groupedJobs.length > 0 ? (
                <div className="flex flex-col gap-10 px-4 md:px-8 max-w-[1400px] mx-auto py-8 w-full">
                  {groupedJobs.map((group) => (
                    <CompanyFeedBlock
                      key={`company-feed-${group.company_id}`}
                      group={group as any}
                      formatTimeAgo={formatTimeAgo}
                      handleViewCompany={handleViewCompany}
                      handleSwipeLeft={handleSwipeLeft}
                      setSelectedJob={setSelectedJob}
                      setSelectedPost={setSelectedPostModal}
                      setAiReason={setAiReason}
                      setAiLearningRec={setAiLearningRec}
                      discoverScrollRef={discoverScrollRef}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl shadow-lg border h-full">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Bookmark className="text-muted-foreground" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-2">{loading ? 'Loading...' : "You're all caught up!"}</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">We've shown you all the jobs that match your preferences. Check back later for more opportunities.</p>
                  <button onClick={fetchJobs} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">Refresh Jobs</button>
                </div>
              )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="w-full h-full overflow-y-auto bg-transparent pb-20 scrollbar-thin">
            <div className="relative w-full overflow-hidden bg-transparent cyber-grid border-b border-[#1E293B] text-white pb-12">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/5 to-transparent"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs md:text-sm font-bold mb-3 tracking-[0.2em] text-[#00F0FF] uppercase neon-text">Track your job applications and respond to company invites</h2>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">My Applications & Invites</h1>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#111827] rounded-3xl shadow-xl border border-[#1E293B] p-6 md:p-8 space-y-6 min-h-[50vh]">
              {loading ? (
                <div className="flex justify-center items-center h-40"><p className="text-[#94A3B8]">Loading applications...</p></div>
              ) : applications.length === 0 ? (
                <div className="text-center mt-20 space-y-4">
                  <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-[#00F0FF]">0</div>
                  <h3 className="text-xl font-bold font-heading text-white">No Applications Yet</h3>
                  <p className="text-[#94A3B8]">Swipe right on jobs in your Discover feed to apply!</p>
                  <button onClick={() => setActiveTab('discover')} className="px-6 py-2.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-lg font-bold hover:bg-[#00F0FF]/20 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.1)]">Find Jobs</button>
                </div>
              ) : (
                <>
                  {/* Invitations */}
                  {applications.filter(a => a.status === 'invited').length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b border-[#1E293B] pb-2 text-white flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse"></span> Company Invitations</h3>
                      <div className="grid gap-4">
                        {applications.filter(a => a.status === 'invited').map(app => (
                          <div key={app.id} className="border border-[#00F0FF]/30 rounded-2xl flex flex-col hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] hover:border-[#00F0FF]/60 transition-all bg-[#0B1120] overflow-hidden group">
                            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
                                <div className="w-16 h-16 bg-[#111827] rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.1)] flex items-center justify-center text-xl font-bold text-[#00F0FF] border border-[#00F0FF]/30 uppercase overflow-hidden shrink-0">
                                  {app.companyLogo ? (
                                    <img src={app.companyLogo.startsWith('http') ? app.companyLogo : `http://localhost:5000${app.companyLogo}`} alt="Logo" className="w-full h-full object-cover" />
                                  ) : (
                                    app.companyName ? app.companyName.charAt(0) : 'C'
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg leading-tight text-white group-hover:text-[#00F0FF] transition-colors">{app.jobTitle}</h3>
                                  <p className="text-[#00F0FF] font-medium text-sm mt-0.5">{app.companyName} has invited you to apply!</p>
                                  <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[#94A3B8] text-xs font-bold uppercase tracking-wider">
                                    <li className="flex items-center gap-1.5"><MapPin size={14} className="text-[#00F0FF]" /> {app.location}</li>
                                    <li className="flex items-center gap-1.5"><DollarSign size={14} className="text-[#00F0FF]" /> {app.salary}</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-3 mt-2 sm:mt-0 shrink-0 w-full sm:w-auto relative z-10">
                                <button onClick={() => updateApplicationStatus(app.id, 'accepted')} className="px-6 py-2.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-lg font-bold hover:bg-[#00F0FF]/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all w-full sm:w-auto text-sm uppercase tracking-wider">Accept Invite</button>
                                <button onClick={() => updateApplicationStatus(app.id, 'rejected')} className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-bold hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all w-full sm:w-auto text-sm uppercase tracking-wider">Decline</button>
                              </div>
                            </div>
                            {app.message && (
                              <div className="px-6 pb-6 pt-0 relative z-10">
                                <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 text-sm text-gray-300">
                                  <span className="font-bold block mb-1 text-[#00F0FF]">Message from {app.companyName}:</span>
                                  <span className="italic">"{app.message}"</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Applications */}
                  {applications.filter(a => a.status === 'pending').length > 0 && (
                    <div className="space-y-4 pt-2">
                      <h3 className="text-lg font-bold border-b border-[#1E293B] pb-2 text-white flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span> Pending Applications</h3>
                      <div className="grid gap-6">
                        {applications.filter(a => a.status === 'pending').map(app => (
                          <div key={app.id} className="border border-[#1E293B] rounded-2xl flex flex-col hover:border-[#334155] transition-all bg-[#0B1120] overflow-hidden relative group">
                            <div className="h-24 relative bg-cover bg-center" style={app.companyBanner ? { backgroundImage: `url(${app.companyBanner.startsWith('http') ? app.companyBanner : `http://localhost:5000${app.companyBanner}`})` } : { backgroundImage: 'linear-gradient(to right, #111827, #1E293B)' }}>
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent"></div>
                            </div>
                            
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                              {app.matchScore !== undefined && (
                                <div className="bg-[#111827]/90 border border-[#00F0FF]/30 backdrop-blur-md px-3 py-1 rounded-full text-[#00F0FF] font-bold text-xs shadow-[0_0_10px_rgba(0,240,255,0.1)] flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]"></div>
                                  {Math.round(app.matchScore)}% Match
                                </div>
                              )}
                            </div>

                            <div className="px-6 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10 -mt-10">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full">
                                <div className="w-20 h-20 bg-[#111827] rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold text-white border border-[#1E293B] uppercase overflow-hidden shrink-0 group-hover:border-[#00F0FF]/30 transition-colors">
                                  {app.companyLogo ? (
                                    <img src={app.companyLogo.startsWith('http') ? app.companyLogo : `http://localhost:5000${app.companyLogo}`} alt="Logo" className="w-full h-full object-cover" />
                                  ) : (
                                    app.companyName ? app.companyName.charAt(0) : 'C'
                                  )}
                                </div>
                                <div className="mt-2 sm:mt-12 flex-1">
                                  <h3 className="font-bold text-xl leading-tight text-white group-hover:text-[#00F0FF] transition-colors">{app.jobTitle}</h3>
                                  <p className="text-[#94A3B8] font-medium text-sm mt-0.5">{app.companyName}</p>
                                  
                                  <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-[#94A3B8] text-xs font-bold uppercase tracking-wider border-t border-[#1E293B] pt-3">
                                    <li className="flex items-center gap-1.5"><MapPin size={14} className="text-[#00F0FF]" /> {app.location}</li>
                                    <li className="flex items-center gap-1.5"><DollarSign size={14} className="text-[#00F0FF]" /> {app.salary}</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 mt-4 sm:mt-12 shrink-0">
                                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                                  Pending
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                                <button 
                                  onClick={() => handleCancelApplication(app.id)}
                                  className="mt-2 text-xs font-bold text-red-500 hover:text-red-400 hover:underline transition-colors uppercase tracking-wider"
                                >
                                  Cancel Application
                                </button>
                              </div>
                            </div>
                            
                            {app.message && (
                              <div className="px-6 pb-6 pt-0">
                                <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 text-sm text-gray-300">
                                  <span className="font-bold block mb-1 text-[#00F0FF] uppercase tracking-wider text-[10px]">Message attached:</span>
                                  <span className="italic">"{app.message}"</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Application History */}
                  {applications.filter(a => a.status !== 'pending' && a.status !== 'invited' && a.status !== 'accepted').length > 0 && (
                    <div className="space-y-4 pt-6">
                      <h3 className="text-lg font-bold border-b border-[#1E293B] pb-2 text-white flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span> Application History</h3>
                      <div className="grid gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        {applications.filter(a => a.status !== 'pending' && a.status !== 'invited' && a.status !== 'accepted').map(app => (
                          <div key={app.id} className="border border-[#1E293B] rounded-2xl flex flex-col transition-all bg-[#0B1120] overflow-hidden grayscale hover:grayscale-0">
                            <div className="h-12 relative bg-cover bg-center" style={app.companyBanner ? { backgroundImage: `url(${app.companyBanner.startsWith('http') ? app.companyBanner : `http://localhost:5000${app.companyBanner}`})` } : { backgroundImage: 'linear-gradient(to right, #1E293B, #334155)' }}>
                              <div className="absolute inset-0 bg-black/50"></div>
                            </div>
                            <div className="px-5 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 -mt-6">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-12 h-12 bg-[#111827] rounded-xl shadow-sm flex items-center justify-center text-lg font-bold text-gray-400 border border-[#1E293B] uppercase overflow-hidden shrink-0">
                                  {app.companyLogo ? (
                                    <img src={app.companyLogo.startsWith('http') ? app.companyLogo : `http://localhost:5000${app.companyLogo}`} alt="Logo" className="w-full h-full object-cover" />
                                  ) : (
                                    app.companyName ? app.companyName.charAt(0) : 'C'
                                  )}
                                </div>
                                <div className="mt-2 sm:mt-6">
                                  <h3 className="font-bold text-base leading-tight text-gray-300">{app.jobTitle}</h3>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-gray-500 font-medium text-sm">{app.companyName}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 mt-2 sm:mt-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${app.status === 'finished' || app.status === 'success' || app.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                                  {app.status === 'finished' || app.status === 'success' || app.status === 'accepted' ? 'Success' : 'Rejected'}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="w-full h-full overflow-y-auto bg-transparent pb-20 scrollbar-thin">
            <div className="relative w-full overflow-hidden bg-transparent cyber-grid border-b border-[#1E293B] text-white pb-12">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/5 to-transparent"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs md:text-sm font-bold mb-3 tracking-[0.2em] text-[#00F0FF] uppercase neon-text">Congratulations! Contact the companies below to schedule your interviews</h2>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">🎉 Your Matches</h1>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#111827] rounded-3xl shadow-xl border border-[#1E293B] p-6 md:p-8 space-y-6 min-h-[50vh]">
              {loading ? (
                <div className="flex justify-center items-center h-40"><p className="text-[#94A3B8]">Loading matches...</p></div>
              ) : applications.filter(a => a.status === 'accepted').length === 0 ? (
                <div className="text-center mt-20 space-y-4">
                  <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">🎯</div>
                  <h3 className="text-xl font-bold font-heading text-white">No Matches Yet</h3>
                  <p className="text-[#94A3B8]">Keep applying and checking your invites. Your next match is just around the corner!</p>
                  <button onClick={() => setActiveTab('discover')} className="px-6 py-2.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-lg font-bold hover:bg-[#00F0FF]/20 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.1)]">Find Jobs</button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {applications.filter(a => a.status === 'accepted').map(app => (
                    <div key={app.id} className="relative border border-[#1E293B] rounded-2xl flex flex-col transition-all bg-[#0B1120] overflow-hidden shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] hover:border-[#00F0FF]/50 group">
                      {app.unreadCount > 0 && (
                        <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 bg-red-500/10 text-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)] border border-red-500/30" title="You have unread messages!">
                          <MessageSquare size={16} fill="currentColor" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0B1120] animate-pulse"></div>
                        </div>
                      )}
                      <div className="p-6 flex flex-col gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div onClick={() => handleViewCompany(app.company_id)} className="w-16 h-16 bg-[#111827] rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.1)] flex items-center justify-center text-2xl font-bold text-[#00F0FF] border border-[#00F0FF]/30 uppercase overflow-hidden shrink-0 cursor-pointer group-hover:border-[#00F0FF] transition-all">
                            {app.companyLogo ? (
                              <img src={app.companyLogo.startsWith('http') ? app.companyLogo : `http://localhost:5000${app.companyLogo}`} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              app.companyName ? app.companyName.charAt(0) : 'C'
                            )}
                          </div>
                          <div className="pr-8">
                            <h3 className="font-bold text-lg leading-tight text-white flex items-center gap-2 group-hover:text-[#00F0FF] transition-colors">
                              {app.jobTitle}
                              {app.unreadCount > 0 && <span title="You have unread messages!" className="text-xl">💬</span>}
                            </h3>
                            <p onClick={() => handleViewCompany(app.company_id)} className="text-[#94A3B8] font-medium text-sm cursor-pointer hover:text-[#00F0FF] transition-colors inline-block mt-0.5">{app.companyName}</p>
                          </div>
                        </div>
                        
                        <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 mt-2">
                          <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider">Contact Options</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => openChat(app)} className="py-2.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-lg text-sm font-bold hover:bg-[#00F0FF]/20 transition-colors flex items-center justify-center gap-2">
                              <MessageSquare size={16} /> Message
                            </button>
                            {app.companyEmail && (
                              <button onClick={() => setEmailModalData({ email: app.companyEmail, subject: `Regarding the ${app.jobTitle} position` })} className="w-full py-2.5 bg-[#1E293B] text-gray-300 border border-[#334155] hover:border-[#00F0FF]/30 hover:text-[#00F0FF] rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <Mail size={16} /> Email
                              </button>
                            )}
                            {app.companyPhone && (
                              <a href={`tel:${app.companyPhone}`} className="py-2.5 bg-[#1E293B] text-gray-300 border border-[#334155] hover:border-[#00F0FF]/30 hover:text-[#00F0FF] rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <Phone size={16} /> Call
                              </a>
                            )}
                            {app.companyWebsite && (
                              <a href={app.companyWebsite.startsWith('http') ? app.companyWebsite : `https://${app.companyWebsite}`} target="_blank" rel="noreferrer" className="py-2.5 bg-[#1E293B] text-gray-300 border border-[#334155] hover:border-[#00F0FF]/30 hover:text-[#00F0FF] rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <Globe size={16} /> Website
                              </a>
                            )}
                            {app.companyLinkedin && (
                              <a href={app.companyLinkedin.startsWith('http') ? app.companyLinkedin : `https://${app.companyLinkedin}`} target="_blank" rel="noreferrer" className="py-2.5 bg-[#1E293B] text-gray-300 border border-[#334155] hover:border-[#00F0FF]/30 hover:text-[#00F0FF] rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 col-span-2">
                                <Linkedin size={16} /> LinkedIn Profile
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Modal */}
        <AnimatePresence>
          {chatModalApplication && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
              <div className="bg-[#111827] w-full max-w-md h-[600px] flex flex-col rounded-[23px] shadow-[0_0_50px_rgba(0,240,255,0.1)] overflow-hidden border border-[#1E293B]">
                {/* Header */}
                <div className="p-4 border-b border-[#1E293B] bg-[#0B1120] text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#111827] text-[#00F0FF] font-bold rounded-[12px] flex items-center justify-center uppercase overflow-hidden shrink-0 border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                      {chatModalApplication.companyLogo ? (
                        <img src={chatModalApplication.companyLogo.startsWith('http') ? chatModalApplication.companyLogo : `http://localhost:5000${chatModalApplication.companyLogo}`} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        chatModalApplication.companyName?.charAt(0) || 'C'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold leading-tight">{chatModalApplication.companyName}</h3>
                      <p className="text-xs opacity-90">{chatModalApplication.jobTitle}</p>
                    </div>
                  </div>
                  <button onClick={() => setChatModalApplication(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111827]">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <MessageSquare size={48} className="mb-4 text-[#00F0FF]" />
                      <p className="text-gray-400">No messages yet.<br/>Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages.map(msg => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                          <div className={`p-3 rounded-2xl ${isMe ? 'bg-[#00F0FF]/20 text-[#00F0FF] rounded-tr-sm shadow-[0_0_15px_rgba(0,240,255,0.1)] border border-[#00F0FF]/30' : 'bg-[#1E293B] text-gray-200 border border-[#334155] rounded-tl-sm shadow-sm'}`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-gray-500 mt-1 px-1">
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1E293B] bg-[#0B1120] flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-[#111827] rounded-full border border-[#1E293B] focus:border-[#00F0FF]/50 focus:ring-2 focus:ring-[#00F0FF]/20 outline-none transition-all text-sm text-white placeholder-gray-500"
                  />
                  <button type="submit" disabled={!newMessage.trim() || isSendingMsg} className="w-10 h-10 bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 rounded-full flex items-center justify-center hover:bg-[#00F0FF]/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors shadow-sm">
                    {isSendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-0.5 mt-0.5" />}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Company Profile Modal */}
          <AnimatePresence>
            {viewingCompanyId && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
                <div className="bg-[#111827] w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.1)] overflow-hidden border border-[#1E293B]">
                  {/* Header Actions */}
                  <div className="absolute top-4 right-4 z-20">
                    <button onClick={() => setViewingCompanyId(null)} className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md border border-white/10">
                      <X size={20} />
                    </button>
                  </div>
                  
                  {isFetchingCompany || !viewingCompanyData ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[500px]">
                      <Loader2 size={48} className="animate-spin text-[#00F0FF] mb-4" />
                      <p className="text-gray-400 font-medium">Loading company profile...</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto">
                      {/* Banner Section */}
                      <div className="h-48 relative bg-cover bg-center" style={viewingCompanyData.banner ? { backgroundImage: `url(${viewingCompanyData.banner.startsWith('http') ? viewingCompanyData.banner : `http://localhost:5000${viewingCompanyData.banner}`})` } : { backgroundImage: 'linear-gradient(to right, #111827, #1E293B)' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent"></div>
                      </div>

                      <div className="px-8 pb-8 relative z-10 bg-[#111827]">
                        {/* Profile Picture */}
                        <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-6">
                          <div className="w-28 h-28 rounded-2xl border-4 border-[#111827] bg-[#0B1120] shadow-[0_0_20px_rgba(0,240,255,0.15)] flex items-center justify-center text-4xl font-bold text-[#00F0FF] relative z-10 overflow-hidden shrink-0 border border-[#1E293B]">
                            {viewingCompanyData.profile_picture ? (
                              <img src={viewingCompanyData.profile_picture.startsWith('http') ? viewingCompanyData.profile_picture : `http://localhost:5000${viewingCompanyData.profile_picture}`} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              viewingCompanyData.name?.charAt(0) || 'C'
                            )}
                          </div>
                          <div className="pb-2">
                            <h2 className="text-2xl font-bold font-heading text-white drop-shadow-md">{viewingCompanyData.name}</h2>
                            <p className="text-[#00F0FF] font-medium flex items-center gap-1.5 mt-1 text-sm">
                              <Building size={14} /> Company Profile
                            </p>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="grid md:grid-cols-3 gap-8 mt-6">
                          <div className="md:col-span-2 space-y-6">
                            <div>
                              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">About Us</h3>
                              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{viewingCompanyData.bio || 'No description provided.'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="bg-[#0B1120] p-5 rounded-2xl border border-[#1E293B]">
                              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Contact Info</h3>
                              <div className="flex flex-col gap-4">
                                {viewingCompanyData.location && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#00F0FF]/10 flex items-center justify-center text-[#00F0FF] shrink-0 border border-[#00F0FF]/30"><MapPin size={14} /></div>
                                    <span className="text-sm font-medium text-gray-300">{viewingCompanyData.location}</span>
                                  </div>
                                )}
                                {viewingCompanyData.email && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#111827] border border-[#1E293B] flex items-center justify-center text-[#00F0FF] shrink-0"><Mail size={14} /></div>
                                    <button onClick={() => setEmailModalData({ email: viewingCompanyData.email, subject: '' })} className="text-sm font-medium hover:text-[#00F0FF] text-gray-300 hover:underline truncate transition-colors text-left">{viewingCompanyData.email}</button>
                                  </div>
                                )}
                                {viewingCompanyData.phone_number && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#111827] border border-[#1E293B] flex items-center justify-center text-[#00F0FF] shrink-0"><Phone size={14} /></div>
                                    <a href={`tel:${viewingCompanyData.phone_number}`} className="text-sm font-medium hover:text-[#00F0FF] text-gray-300 hover:underline transition-colors">{viewingCompanyData.phone_number}</a>
                                  </div>
                                )}
                                {viewingCompanyData.website_link && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#00F0FF]/10 flex items-center justify-center text-[#00F0FF] shrink-0 border border-[#00F0FF]/30"><Globe size={14} /></div>
                                    <a href={viewingCompanyData.website_link.startsWith('http') ? viewingCompanyData.website_link : `https://${viewingCompanyData.website_link}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#00F0FF] hover:underline truncate">Website</a>
                                  </div>
                                )}
                                {viewingCompanyData.linkedin_link && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#00F0FF]/10 flex items-center justify-center text-[#00F0FF] shrink-0 border border-[#00F0FF]/30"><Linkedin size={14} /></div>
                                    <a href={viewingCompanyData.linkedin_link.startsWith('http') ? viewingCompanyData.linkedin_link : `https://${viewingCompanyData.linkedin_link}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#00F0FF] hover:underline truncate">LinkedIn</a>
                                  </div>
                                )}
                                {!viewingCompanyData.email && !viewingCompanyData.phone_number && !viewingCompanyData.website_link && !viewingCompanyData.linkedin_link && !viewingCompanyData.location && (
                                  <p className="text-sm text-gray-500 italic">No contact info provided.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </AnimatePresence>

        {activeTab === 'rankings' && (
          <div className="w-full h-full overflow-y-auto bg-transparent pb-20 scrollbar-thin">
            <div className="relative w-full overflow-hidden bg-transparent cyber-grid border-b border-[#1E293B] text-white pb-12">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/5 to-transparent"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs md:text-sm font-bold mb-3 tracking-[0.2em] text-[#00F0FF] uppercase neon-text">Ranked based on your skills and profile</h2>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">Top Job Matches</h1>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#111827] rounded-3xl shadow-xl border border-[#1E293B] p-6 md:p-8 space-y-6 min-h-[50vh]">
              {loading ? (
                <div className="flex justify-center items-center h-full"><p className="text-gray-400">Calculating match scores...</p></div>
              ) : jobs.filter(j => j.item_type !== 'post' && j.matchScore >= 1).length === 0 ? (
                <div className="text-center mt-20 space-y-4">
                  <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-gray-500">0</div>
                  <h3 className="text-xl font-bold font-heading text-white">No Matches Found</h3>
                  <p className="text-gray-400">No jobs currently match your skills above 0%. Update your skills to find better matches!</p>
                </div>
              ) : (
                jobs.filter(j => j.item_type !== 'post' && j.matchScore >= 1).map((job, index) => (
                  <div key={`job-${job.id}`} className="bg-[#0B1120] rounded-3xl shadow-sm border border-[#1E293B] p-4 md:p-6 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-[#00F0FF]/30 transition-all flex flex-col md:flex-row gap-6 relative group">
                    
                    {/* Left: Rank & Image */}
                    <div className="w-full md:w-1/3 relative rounded-2xl overflow-hidden min-h-[150px] md:min-h-[200px] shadow-sm shrink-0">
                      <div className="absolute inset-0 bg-cover bg-center" style={job.companyBanner ? { backgroundImage: `url(${job.companyBanner.startsWith('http') ? job.companyBanner : `http://localhost:5000${job.companyBanner}`})` } : { backgroundImage: 'linear-gradient(to right, #111827, #1E293B)' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent"></div>
                      </div>
                      
                      <div className="absolute top-4 left-4 flex flex-col items-center justify-center w-12 h-12 bg-[#111827]/90 backdrop-blur-md text-[#00F0FF] font-bold rounded-xl shrink-0 border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.2)] z-10">
                        <span className="text-[10px] opacity-70 uppercase tracking-wider">Rank</span>
                        <span className="text-lg leading-none">{index + 1}</span>
                      </div>

                      <div onClick={(e) => { e.stopPropagation(); handleViewCompany(job.company_id); }} className="absolute bottom-4 right-4 w-16 h-16 bg-[#111827] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center text-2xl font-bold text-[#00F0FF] border-2 border-[#1E293B] cursor-pointer group-hover:border-[#00F0FF]/50 transition-all z-10 overflow-hidden">
                        {job.companyLogo ? (
                          <img src={job.companyLogo.startsWith('http') ? job.companyLogo : `http://localhost:5000${job.companyLogo}`} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          job.companyName ? job.companyName.charAt(0) : 'C'
                        )}
                      </div>
                    </div>
                    
                    {/* Right: Content Section */}
                    <div className="w-full md:w-2/3 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-xl leading-tight text-white group-hover:text-[#00F0FF] transition-colors">{job.title}</h3>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <p onClick={(e) => { e.stopPropagation(); handleViewCompany(job.company_id); }} className="text-gray-400 font-medium text-sm cursor-pointer hover:text-[#00F0FF] transition-colors inline-block w-fit">{job.companyName}</p>
                            <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1 uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse"></span> {formatTimeAgo(job.created_at)}</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 bg-[#111827] px-4 py-2 rounded-lg border border-[#1E293B]">
                          <span className={`font-bold tracking-wider ${job.matchScore >= 80 ? 'text-[#00F0FF]' : job.matchScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {job.matchScore}% MATCH
                          </span>
                        </div>
                      </div>

                      <ul className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-[#1E293B] text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <li className="flex items-center gap-1.5"><MapPin size={14} className="text-[#00F0FF]" /> {job.location}</li>
                        <li className="flex items-center gap-1.5"><DollarSign size={14} className="text-[#00F0FF]" /> {job.salary}</li>
                      </ul>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                        <div className="w-full sm:hidden flex items-center justify-between bg-[#111827] px-4 py-2 rounded-lg border border-[#1E293B]">
                           <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Match Score</span>
                           <span className={`font-bold ${job.matchScore >= 80 ? 'text-[#00F0FF]' : job.matchScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {job.matchScore}%
                           </span>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedJob(job);
                            setAiReason(null);
                            setAiLearningRec(null);
                          }}
                          className="w-full bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 hover:border-[#00F0FF]/50 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                        >
                          View Job
                        </button>
                      </div>
                    </div>
                    {job.companyBio && (
                      <div className="px-5 pb-5 mt-4">
                        <p className="text-sm text-gray-400 italic border-l-2 border-[#00F0FF] pl-4">
                          "{job.companyBio.substring(0, 100)}{job.companyBio.length > 100 ? '...' : ''}"
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="w-full h-full overflow-y-auto bg-transparent pb-20 scrollbar-thin">
            <div className="relative w-full overflow-hidden bg-transparent cyber-grid border-b border-[#1E293B] text-white pb-12">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/5 to-transparent"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs md:text-sm font-bold mb-3 tracking-[0.2em] text-[#00F0FF] uppercase neon-text">Upcoming and past interview schedules</h2>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">My Interviews</h1>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#111827] rounded-3xl shadow-xl border border-[#1E293B] p-6 md:p-8 space-y-6 min-h-[50vh]">
              {interviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 h-full">
                  <div className="w-20 h-20 bg-[#1E293B] rounded-full flex items-center justify-center mb-6 border border-[#334155] shadow-inner">
                    <Briefcase className="text-[#00F0FF]" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-2 text-white">No Interviews</h3>
                  <p className="text-gray-400 max-w-md">You don't have any interview invitations yet. Keep applying!</p>
                </div>
              ) : (
                interviews.map(interview => (
                  <div key={interview.id} className="bg-[#0B1120] p-6 rounded-2xl border border-[#1E293B] shadow-sm flex flex-col sm:flex-row justify-between gap-6 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-[#00F0FF]/30 transition-all group">
                    <div className="flex gap-5">
                      <div className="w-16 h-16 bg-[#111827] rounded-xl flex items-center justify-center text-2xl font-bold text-[#00F0FF] shrink-0 uppercase overflow-hidden border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)] group-hover:border-[#00F0FF]/50 transition-colors">
                        {interview.company_picture ? (
                          <img src={interview.company_picture.startsWith('http') ? interview.company_picture : `http://localhost:5000${interview.company_picture}`} alt={interview.company_name} className="w-full h-full object-cover" />
                        ) : (
                          interview.company_name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white group-hover:text-[#00F0FF] transition-colors">{interview.company_name}</h3>
                        <p className="text-[#94A3B8] text-sm font-medium mb-2">{interview.job_title}</p>
                        <div className="flex flex-col gap-1 text-sm text-gray-300">
                          <span className="font-bold flex items-center gap-1.5"><Calendar size={14} className="text-[#00F0FF]" /> {new Date(interview.scheduled_date).toLocaleString()}</span>
                          <span className="font-bold flex items-center gap-1.5"><MapPin size={14} className="text-[#00F0FF]" /> <span className="capitalize">{interview.type}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[160px] justify-between">
                      <span className={`px-4 py-1.5 rounded-full text-center text-[10px] font-bold uppercase tracking-widest border ${
                        interview.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.1)]' :
                        interview.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
                        'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                      }`}>
                        {interview.status}
                      </span>
                      {interview.status === 'scheduled' && (
                        interview.type === 'online' ? (
                          <a href={interview.link_or_location.startsWith('http') ? interview.link_or_location : `https://${interview.link_or_location}`} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-[#00F0FF]/10 text-[#00F0FF] text-center rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(0,240,255,0.1)] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/20 hover:border-[#00F0FF]/50 transition-all uppercase tracking-wider">
                            Join Online
                          </a>
                        ) : (
                          <a href={`https://maps.google.com/?q=${encodeURIComponent(interview.link_or_location)}`} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-[#00F0FF]/10 text-[#00F0FF] text-center rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(0,240,255,0.1)] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/20 hover:border-[#00F0FF]/50 transition-all uppercase tracking-wider">
                            View Location
                          </a>
                        )
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="w-full h-full bg-transparent overflow-y-auto pb-20">
            {/* Banner */}
            <div className="h-48 relative bg-cover bg-center" style={user.banner ? { backgroundImage: `url(${user.banner.startsWith('http') ? user.banner : `http://localhost:5000${user.banner}`})` } : { backgroundImage: 'linear-gradient(to right, #111827, #1E293B)' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#030213] to-transparent"></div>
            </div>

            <div className="px-6 sm:px-12 pb-12 relative">
              {!isEditingProfile ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* Left Column - Sidebar */}
                  <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-center sm:items-start">
                    {/* Profile Picture */}
                    <div className="w-40 h-40 rounded-3xl border-[6px] border-[#030213] bg-[#0B1120] shadow-[0_0_30px_rgba(0,240,255,0.2)] flex items-center justify-center text-5xl font-bold text-[#00F0FF] relative z-10 overflow-hidden shrink-0 -mt-20 mb-4 border border-[#00F0FF]/30">
                      {user.profile_picture ? (
                        <img src={user.profile_picture?.startsWith('http') ? user.profile_picture : `http://localhost:5000${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user.name ? user.name.substring(0, 2).toUpperCase() : 'HQ'
                      )}
                    </div>

                    {/* Name & Title */}
                    <div className="text-center sm:text-left mb-6 w-full">
                      <h2 className="text-3xl font-bold font-heading text-white mb-1">{user.name}</h2>
                      <p className="text-[#00F0FF] font-medium text-sm flex items-center justify-center sm:justify-start gap-2">
                        <Briefcase size={14} className="text-[#00F0FF]" /> Job Seeker Candidate
                      </p>
                    </div>

                    {/* Action Button */}
                    <button onClick={() => setIsEditingProfile(true)} className="w-full py-2.5 bg-[#111827] hover:bg-[#1E293B] text-white rounded-[8px] font-bold text-sm transition-colors border border-[#334155] shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:border-[#00F0FF]/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] mb-8 flex items-center justify-center gap-2">
                      Manage your account
                    </button>

                    {/* Details Sections */}
                    <div className="w-full space-y-8">
                      {/* ABOUT */}
                      <div>
                        <h3 className="text-[11px] font-bold text-[#00F0FF] neon-text uppercase tracking-widest mb-4">About</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                            <Briefcase size={16} className="text-[#00F0FF] shrink-0" />
                            <span>{user.skills ? user.skills.split(',')[0].trim() : 'Professional'}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                            <GraduationCap size={16} className="text-[#00F0FF] shrink-0" />
                            <span>{user.education_level || 'Education not provided'}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                            <MapPin size={16} className="text-[#00F0FF] shrink-0" />
                            <span>{user.location || 'Location not set'}</span>
                          </div>
                        </div>
                      </div>

                      {/* CONTACT */}
                      <div>
                        <h3 className="text-[11px] font-bold text-[#00F0FF] neon-text uppercase tracking-widest mb-4">Contact</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                            <Mail size={16} className="text-[#00F0FF] shrink-0" />
                            <span className="truncate">{user.email || 'No email provided'}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                            <Phone size={16} className="text-[#00F0FF] shrink-0" />
                            <span>{user.phone_number || 'No phone number provided'}</span>
                          </div>
                          {user.linkedin_link && (
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                              <Linkedin size={16} className="text-[#00F0FF] shrink-0" />
                              <a href={user.linkedin_link.startsWith('http') ? user.linkedin_link : `https://${user.linkedin_link}`} target="_blank" rel="noreferrer" className="text-[#00F0FF] hover:underline truncate">LinkedIn Profile</a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TEAMS / PREFERENCES */}
                      <div>
                        <h3 className="text-[11px] font-bold text-[#00F0FF] neon-text uppercase tracking-widest mb-4">Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-2"><Globe size={14}/> AI Insights Language</span>
                            <div className="flex bg-[#0B1120] p-1 rounded-lg border border-[#1E293B]">
                              <button onClick={() => setAiLanguage('en')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${aiLanguage === 'en' ? 'bg-[#00F0FF]/20 shadow-[0_0_10px_rgba(0,240,255,0.1)] text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'}`}>English</button>
                              <button onClick={() => setAiLanguage('ms')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${aiLanguage === 'ms' ? 'bg-[#00F0FF]/20 shadow-[0_0_10px_rgba(0,240,255,0.1)] text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'}`}>Melayu</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-[#1E293B] space-y-3">
                        <button onClick={handleSignOut} className="w-full py-2 bg-[#111827] text-gray-400 rounded-[8px] font-bold text-sm hover:text-white hover:bg-[#1E293B] transition-colors border border-[#334155]">
                          Sign Out
                        </button>
                        <button onClick={handleDeleteAccount} className="w-full py-2 bg-red-500/10 text-red-500 rounded-[8px] font-bold text-sm hover:bg-red-500/20 transition-colors border border-red-500/20">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Main Content */}
                  <div className="lg:col-span-8 xl:col-span-9 space-y-10 lg:pl-4 lg:pt-8">
                    
                    {/* Introduction Section */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4 drop-shadow-md">Introduction</h3>
                      <div className="text-sm leading-relaxed text-gray-300 font-medium whitespace-pre-line bg-[#111827] p-6 rounded-3xl border border-[#1E293B]">
                        {user.bio || 'No introduction provided yet.'}
                      </div>
                      
                      {user.skills && (
                        <div className="mt-6">
                          <h4 className="text-xs font-bold text-[#00F0FF] neon-text uppercase tracking-wider mb-3">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {user.skills.split(',').map((s: string, i: number) => (
                              <span key={i} className={`px-3 py-1 ${getSkillColor(s.trim())} rounded-full text-xs font-bold border`}>{s.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Uploaded Documents Section (Jira "Worked on" style) */}
                    <div>
                      <div className="flex items-center justify-between mb-4 mt-8">
                        <h3 className="text-xl font-bold text-white drop-shadow-md">Visual Assets & Documents</h3>
                        <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider">Only you and employers can see this</span>
                      </div>
                      
                      <div className="bg-[#111827] rounded-[23px] border border-[#1E293B] shadow-sm overflow-hidden">
                        <div className="p-2">
                          {[
                            { key: 'resume', label: 'Resume Document', icon: <FileText size={18} className="text-[#00F0FF]" />, desc: 'PDF Format', url: user.resume, onRemove: () => handleRemoveFile('resume') },
                            ...certificates.map((cert, i) => ({
                              key: `cert-${cert.id}`,
                              label: cert.title || `Certificate ${i + 1}`,
                              icon: <GraduationCap size={18} className="text-[#00F0FF]" />,
                              desc: cert.issuer || 'PDF/Image Format',
                              url: cert.file_url,
                              onRemove: () => handleDeleteCertificate(cert.id)
                            }))
                          ].map((item, idx) => (
                            <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl transition-colors ${idx !== 0 ? 'border-t border-[#1E293B]' : ''} hover:bg-[#1E293B]`}>
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#0B1120] flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.1)] border border-[#00F0FF]/30">
                                  {item.icon}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white mb-0.5">{item.label}</h4>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{item.desc}</p>
                                </div>
                              </div>
                              {item.url ? (
                                <div className="flex items-center gap-3">
                                  <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-green-500/30">Uploaded</span>
                                  <a href={item.url.startsWith('http') ? item.url : `http://localhost:5000${item.url}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#00F0FF] hover:underline">View</a>
                                  <button onClick={item.onRemove} className="text-sm font-medium text-red-500 hover:text-red-400 ml-2">Remove</button>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-gray-500 italic">Not Uploaded</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="px-4 py-4 bg-[#0B1120] border-t border-[#1E293B] text-xs font-bold text-[#00F0FF] uppercase tracking-wider hover:bg-[#1E293B] cursor-pointer transition-colors text-center" onClick={() => setIsEditingProfile(true)}>
                          Upload new documents
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-10">
                  
                  {/* Top Section - Text Details */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold mb-2 block uppercase text-[#00F0FF] neon-text tracking-widest">Full Name</label>
                        <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full p-4 text-lg border border-[#1E293B] rounded-2xl bg-[#0B1120] focus:ring-2 focus:ring-[#00F0FF]/20 focus:border-[#00F0FF]/50 focus:bg-[#111827] outline-none transition-all text-white placeholder-gray-500" required />
                      </div>
                      <div>
                        <label className="text-xs font-bold mb-2 block uppercase text-[#00F0FF] neon-text tracking-widest">Email Address</label>
                        <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full p-4 text-lg border border-[#1E293B] rounded-2xl bg-[#0B1120] focus:ring-2 focus:ring-[#00F0FF]/20 focus:border-[#00F0FF]/50 focus:bg-[#111827] outline-none transition-all text-white placeholder-gray-500" required />
                      </div>
                      <div>
                        <label className="text-xs font-bold mb-2 block uppercase text-[#00F0FF] neon-text tracking-widest">Phone Number</label>
                        <input type="tel" value={profileData.phone_number} onChange={e => setProfileData({...profileData, phone_number: e.target.value})} placeholder="+60 12-345 6789" className="w-full p-4 text-lg border border-[#1E293B] rounded-2xl bg-[#0B1120] focus:ring-2 focus:ring-[#00F0FF]/20 focus:border-[#00F0FF]/50 focus:bg-[#111827] outline-none transition-all text-white placeholder-gray-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold mb-2 block uppercase text-[#00F0FF] neon-text tracking-widest">Education Level</label>
                        <select value={profileData.education_level} onChange={e => setProfileData({...profileData, education_level: e.target.value})} className="w-full p-4 text-lg border border-[#1E293B] rounded-2xl bg-[#0B1120] focus:ring-2 focus:ring-[#00F0FF]/20 focus:border-[#00F0FF]/50 focus:bg-[#111827] outline-none transition-all text-white">
                          <option value="">Select Education Level</option>
                          <option value="SPM">SPM / O-Level</option>
                          <option value="STPM">STPM / A-Level / Foundation</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Bachelor's Degree">Bachelor's Degree</option>
                          <option value="Master's Degree">Master's Degree</option>
                          <option value="PhD / Doctorate">PhD / Doctorate</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold mb-2 block uppercase text-[#00F0FF] neon-text tracking-widest">Location</label>
                        <input type="text" value={profileData.location} onChange={e => setProfileData({...profileData, location: e.target.value})} placeholder="e.g. Kuala Lumpur, Malaysia" className="w-full p-4 text-lg border border-[#1E293B] rounded-2xl bg-[#0B1120] focus:ring-2 focus:ring-[#00F0FF]/20 focus:border-[#00F0FF]/50 focus:bg-[#111827] outline-none transition-all text-white placeholder-gray-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold mb-2 block uppercase text-[#00F0FF] neon-text tracking-widest">LinkedIn Profile URL</label>
                        <input type="url" value={profileData.linkedin_link} onChange={e => setProfileData({...profileData, linkedin_link: e.target.value})} placeholder="e.g. https://linkedin.com/in/username" className="w-full p-4 text-lg border border-[#1E293B] rounded-2xl bg-[#0B1120] focus:ring-2 focus:ring-[#00F0FF]/20 focus:border-[#00F0FF]/50 focus:bg-[#111827] outline-none transition-all text-white placeholder-gray-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold mb-2 block uppercase text-[#00F0FF] neon-text tracking-widest">Primary Skill / Job Title</label>
                        <input type="text" value={profileData.skills} onChange={e => setProfileData({...profileData, skills: e.target.value})} placeholder="e.g. Java Developer, React..." className="w-full p-4 text-lg border border-[#1E293B] rounded-2xl bg-[#0B1120] focus:ring-2 focus:ring-[#00F0FF]/20 focus:border-[#00F0FF]/50 focus:bg-[#111827] outline-none transition-all text-white placeholder-gray-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-2 block uppercase text-[#00F0FF] neon-text tracking-widest">Bio</label>
                      <textarea rows={6} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} placeholder="Tell us about yourself..." className="w-full p-4 text-lg border border-[#1E293B] rounded-2xl bg-[#0B1120] focus:ring-2 focus:ring-[#00F0FF]/20 focus:border-[#00F0FF]/50 focus:bg-[#111827] outline-none transition-all resize-none text-white placeholder-gray-500"></textarea>
                    </div>
                  </div>

                  {/* Bottom Section - Visual Assets */}
                  <div className="space-y-6 bg-[#111827] p-8 rounded-3xl border border-[#1E293B]">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white"><ImageIcon className="text-[#00F0FF]"/> Visual Assets</h3>
                    <p className="text-gray-400 mb-6">Update your profile picture and banner image to personalize your account.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-[#0B1120] p-5 rounded-2xl border border-[#1E293B] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <label className="text-sm font-bold mb-3 flex items-center justify-between text-white">
                          <span className="flex items-center gap-2"><ImageIcon size={16} className="text-[#00F0FF]"/> Profile Picture</span>
                          {croppedImageBlob && <span className="text-[10px] uppercase tracking-wider font-bold bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-md">Cropped Ready</span>}
                        </label>
                        <input type="file" name="profile_picture" accept="image/*" onChange={handleProfileImageSelect} className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-[#00F0FF]/30 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-[#00F0FF]/10 file:text-[#00F0FF] hover:file:bg-[#00F0FF]/20 cursor-pointer text-gray-400" />
                      </div>
                      <div className="bg-[#0B1120] p-5 rounded-2xl border border-[#1E293B] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <label className="text-sm font-bold mb-3 flex items-center gap-2 text-white"><ImageIcon size={16} className="text-[#00F0FF]"/> Banner Image</label>
                        <input type="file" name="banner" accept="image/*" className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-[#00F0FF]/30 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-[#00F0FF]/10 file:text-[#00F0FF] hover:file:bg-[#00F0FF]/20 cursor-pointer text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* My Resume Section */}
                  <div className="mt-12 pt-10 border-t border-[#1E293B]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="text-[#00F0FF]" /> My Resume</h3>
                        <p className="text-sm text-gray-400 mt-1">Upload your latest resume for employers to view.</p>
                      </div>
                      <label className="px-6 py-3 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:bg-[#00F0FF]/20 cursor-pointer transition-colors flex items-center gap-2">
                        <Upload size={16} /> Upload Resume
                        <input type="file" name="resume" className="hidden" accept="application/pdf" onChange={e => {
                          if (e.target.files && e.target.files.length > 0) {
                            setSelectedResumeName(e.target.files[0].name);
                          }
                        }} />
                      </label>
                    </div>

                    {selectedResumeName ? (
                      <div className="bg-[#00F0FF]/5 rounded-3xl border border-[#00F0FF]/30 p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 flex items-center justify-center text-[#00F0FF] shrink-0 border border-[#00F0FF]/20">
                           <FileText size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-white">{selectedResumeName}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-[#00F0FF] font-bold">Ready to be saved (click Save Changes below)</p>
                        </div>
                      </div>
                    ) : user.resume ? (
                      <div className="bg-[#0B1120] rounded-3xl border border-[#1E293B] p-6 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#111827] border border-[#334155] flex items-center justify-center text-[#00F0FF] shrink-0">
                             <FileText size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-white">Current Resume</h4>
                            <a href={user.resume.startsWith('http') ? user.resume : `http://localhost:5000${user.resume}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#00F0FF] hover:underline">View PDF</a>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleRemoveFile('resume')} className="text-red-500 hover:text-red-400 bg-red-500/10 p-2 rounded-full transition-colors border border-red-500/20" title="Remove Resume">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[#0B1120] rounded-3xl p-8 text-center border border-dashed border-[#334155]">
                        <FileText size={40} className="mx-auto text-[#334155] mb-3" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No resume uploaded yet.</p>
                      </div>
                    )}
                  </div>

                  {/* My Certificates Section */}
                  <div className="mt-12 pt-10 border-t border-[#1E293B]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2"><GraduationCap className="text-[#00F0FF]" /> My Certificates</h3>
                        <p className="text-sm text-gray-400 mt-1">Upload and AI-scan your certificates to highlight your qualifications.</p>
                      </div>
                      <label className="px-6 py-3 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:bg-[#00F0FF]/20 cursor-pointer transition-colors flex items-center gap-2">
                        {isUploadingCert ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {isUploadingCert ? 'Scanning...' : 'Upload & Scan'}
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleCertificateUpload} disabled={isUploadingCert} />
                      </label>
                    </div>

                    {certificates.length === 0 ? (
                      <div className="bg-[#0B1120] rounded-3xl p-8 text-center border border-dashed border-[#334155]">
                        <FileCheck size={40} className="mx-auto text-[#334155] mb-3" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No certificates uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {certificates.map(cert => (
                          <div key={cert.id} className="bg-[#0B1120] rounded-3xl border border-[#1E293B] p-6 shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-shadow relative group flex flex-col justify-between hover:border-[#00F0FF]/30">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-[#111827] border border-[#334155] flex items-center justify-center text-[#00F0FF] shrink-0">
                                 <FileCheck size={24} />
                              </div>
                              <div className="flex-1 pr-8">
                                <h4 className="font-bold text-lg text-white mb-1 line-clamp-1">{cert.title || 'Untitled Certificate'}</h4>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{cert.issuer || 'Unknown Issuer'} {cert.issue_date ? `• ${cert.issue_date}` : ''}</p>
                              </div>
                            </div>
                            
                            <button type="button" onClick={() => handleDeleteCertificate(cert.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 p-2 rounded-full border border-red-500/20">
                              <Trash2 size={16} />
                            </button>
                            
                            {cert.skills_extracted && (
                              <div className="flex flex-wrap gap-2 mb-6">
                                {cert.skills_extracted.split(',').map((s: string, idx: number) => {
                                  if (!s.trim()) return null;
                                  return <span key={idx} className={`px-2 py-1 ${getSkillColor(s.trim())} text-[10px] font-bold rounded-md border uppercase tracking-wider`}>{s.trim()}</span>;
                                })}
                              </div>
                            )}
                            
                            <a href={cert.file_url.startsWith('http') ? cert.file_url : `http://localhost:5000${cert.file_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#00F0FF] hover:text-white transition-colors mt-auto">
                              <FileText size={14} /> View Original Document
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-12 pb-8 border-t border-[#1E293B] mt-12">
                    <button type="submit" className="px-12 py-3.5 bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 rounded-[23px] font-bold text-lg hover:bg-[#00F0FF]/30 transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-12 py-3.5 bg-[#111827] text-gray-400 rounded-[23px] font-bold text-lg hover:bg-[#1E293B] hover:text-white transition-colors border border-[#334155] shadow-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

        {/* FULLSCREEN POST MODAL */}
        <AnimatePresence>
          {selectedPostModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm"
              onClick={() => setSelectedPostModal(null)}
            >
              <div 
                className="relative w-full max-w-lg aspect-[4/5] bg-black rounded-[30px] overflow-hidden shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setSelectedPostModal(null)} className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">
                  <X size={24} />
                </button>
                
                {selectedPostModal.media_type === 'image' ? (
                  <img src={selectedPostModal.media_url.startsWith('http') ? selectedPostModal.media_url : `http://localhost:5000${selectedPostModal.media_url}`} alt="Post" className="w-full h-full object-contain bg-black" />
                ) : selectedPostModal.media_type === 'video' ? (
                  <video src={selectedPostModal.media_url.startsWith('http') ? selectedPostModal.media_url : `http://localhost:5000${selectedPostModal.media_url}`} className="w-full h-full object-contain bg-black" autoPlay loop controls />
                ) : (
                  <div className={`w-full h-full p-8 flex flex-col ${selectedPostModal.text_position || 'justify-center items-center text-center'} ${selectedPostModal.background_style || 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500'}`}>
                    <p className={`font-bold font-heading text-2xl sm:text-3xl whitespace-pre-wrap leading-tight break-words max-h-full overflow-y-auto scrollbar-thin ${selectedPostModal.background_style === 'bg-white' ? 'text-[#2a2a2a]' : 'text-white'}`}>
                      {selectedPostModal.caption}
                    </p>
                  </div>
                )}
                
                {/* Overlay details for image/video */}
                {selectedPostModal.media_type !== 'text' && (
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <p className="text-white font-medium text-sm sm:text-base whitespace-pre-wrap">{selectedPostModal.caption}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <EmailComposeModal 
        isOpen={!!emailModalData} 
        onClose={() => setEmailModalData(null)} 
        email={emailModalData?.email || ''} 
        subject={emailModalData?.subject || ''} 
      />

      {/* Confirm Dialog Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F0FF] to-[#FF66B2]"></div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">HireQuest System</h3>
            <p className="text-gray-300 mb-8 font-medium">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog(null)} className="px-5 py-2.5 bg-[#0B1120] text-gray-300 font-bold rounded-lg hover:bg-[#1E293B] border border-[#1E293B] transition-colors">Cancel</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="px-5 py-2.5 bg-gradient-to-r from-[#00F0FF] to-[#00C0CC] text-[#030213] font-black rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all uppercase tracking-wide">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
