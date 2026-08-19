import React, { useState, useEffect, useCallback, useRef } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { User, Briefcase, MapPin, AlignLeft, GraduationCap, Upload, Award, FileText, LayoutDashboard, Search, Trash2, X, Plus, Zap, MessageSquare, Settings, LogOut, CheckCircle, Globe, ChevronRight, Users, Check, Loader2, Send, Building, Linkedin, Mail, Phone, Image as ImageIcon, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CandidateFeedBlock from '../components/shared/CandidateFeedBlock';
import EmailComposeModal from '../components/shared/EmailComposeModal';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

export default function CompanyDashboard() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [discoverCandidates, setDiscoverCandidates] = useState<any[]>([]);
  const [discoverSearchQuery, setDiscoverSearchQuery] = useState('');
  const [rankingJobFilter, setRankingJobFilter] = useState('all');
  const [emailModalData, setEmailModalData] = useState<{email: string, subject: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchFilterJob, setMatchFilterJob] = useState('All');
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'discover'|'applicants'|'interviews'|'create_job'|'rankings'|'profile'|'my_jobs'|'matches'>('discover');
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const [applicantView, setApplicantView] = useState<'pending'|'history'>('pending');
  const [selectedApplicantJobFilter, setSelectedApplicantJobFilter] = useState<string>('All');
  const navigate = useNavigate();
  const discoverScrollRef = useRef<HTMLDivElement>(null);
  
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

  const [aiReasons, setAiReasons] = useState<Record<string, string>>({});
  const [fetchingReasonId, setFetchingReasonId] = useState<string | null>(null);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState<any | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  
  const [createMode, setCreateMode] = useState<'job'|'ad'>('job');
  const [postCaption, setPostCaption] = useState('');
  const [postMedia, setPostMedia] = useState<File | null>(null);
  const [postMediaType, setPostMediaType] = useState<'image'|'video'|'text'>('text');
  const [postBackgroundStyle, setPostBackgroundStyle] = useState('bg-gradient-to-br from-purple-500 to-indigo-600');
  const [postTextPosition, setPostTextPosition] = useState('justify-center items-center text-center');
  
  const [companyPosts, setCompanyPosts] = useState<any[]>([]);
  const [myContentMode, setMyContentMode] = useState<'jobs'|'ads'>('jobs');
  const [selectedPostModal, setSelectedPostModal] = useState<any | null>(null);
  
  
  const [chatModalApplication, setChatModalApplication] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Interview States
  const [interviews, setInterviews] = useState<any[]>([]);
  const [schedulingApplicant, setSchedulingApplicant] = useState<any | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    type: 'online',
    link: ''
  });
  
  const fetchInterviews = async () => {
    try {
      const res = await fetch(`/api/interviews/company/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApplicant) return;
    try {
      const datetime = `${interviewForm.date} ${interviewForm.time}:00`;
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: schedulingApplicant.id,
          company_id: user.id,
          seeker_id: schedulingApplicant.seeker_id,
          scheduled_date: datetime,
          type: interviewForm.type,
          link_or_location: interviewForm.link,
          notes: ''
        })
      });
      if (res.ok) {
        toast.success('Interview scheduled successfully!');
        setSchedulingApplicant(null);
        setInterviewForm({ date: '', time: '', type: 'online', link: '' });
        fetchApplicants();
        fetchInterviews();
      } else {
        toast.error('Failed to schedule interview');
      }
    } catch (err) {
      toast.error('Error scheduling interview');
    }
  };

  const handleUpdateInterviewStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/interviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Interview marked as ${status}`);
        fetchInterviews();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const openChat = async (app: any) => {
    setChatModalApplication(app);
    try {
      await fetch(`/api/messages/read/${app.id}/${user.id}`, { method: 'PUT' });
      setApplicants(prev => prev.map(a => a.id === app.id ? { ...a, unreadCount: 0 } : a));
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
          receiver_id: chatModalApplication.seeker_id,
          content: newMessage
        })
      });
      if (res.ok) {
        setNewMessage('');
        const msgRes = await fetch(`/api/messages/${chatModalApplication.id}`);
        const msgData = await msgRes.json();
        setChatMessages(msgData);
        fetchApplicants();
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setIsSendingMsg(false);
    }
  };

  const fetchAiReason = async (seekerId: number, jobId: number, cardId: string) => {
    setFetchingReasonId(cardId);
    try {
      const res = await fetch('/api/ai/match-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seekerId, jobId, lang: aiLanguage })
      });
      const data = await res.json();
      if (data.success) {
        setAiReasons(prev => ({ ...prev, [cardId]: data.reason }));
      } else {
        toast.error(aiLanguage === 'en' ? 'Failed to get AI reason.' : 'Gagal mendapatkan ulasan AI.');
      }
    } catch (error) {
      console.error(error);
      toast.error(aiLanguage === 'en' ? 'Error fetching AI reason.' : 'Ralat mendapatkan ulasan AI.');
    } finally {
      setFetchingReasonId(null);
    }
  };
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    skills: user.skills || '',
    bio: user.bio || '',
    phone_number: user.phone_number || '',
    website_link: user.website_link || '',
    linkedin_link: user.linkedin_link || '',
    location: user.location || ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      skills: user.skills || '',
      bio: user.bio || '',
      phone_number: user.phone_number || '',
      website_link: user.website_link || '',
      linkedin_link: user.linkedin_link || '',
      location: user.location || ''
    });
  }, [user]);
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
    if (!user.id || user.role !== 'company') {
      navigate('/login');
      return;
    }
    if (activeTab === 'discover' || activeTab === 'rankings') {
      fetchDiscoverCandidates();
      fetchCompanyJobs();
    }
    else if (activeTab === 'applicants' || activeTab === 'matches') fetchApplicants();
    else if (activeTab === 'my_jobs') {
      fetchCompanyJobs();
      fetchCompanyPosts();
    } else if (activeTab === 'interviews') {
      fetchInterviews();
    }
  }, [user.id, activeTab]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/applications/company/${user.id}`);
      const data = await response.json();
      setApplicants(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscoverCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/candidates/match/${user.id}`);
      const data = await response.json();
      setDiscoverCandidates(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load recommended candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/company/${user.id}`);
      const data = await response.json();
      setCompanyJobs(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyPosts = async () => {
    try {
      const response = await fetch(`/api/company-posts/company/${user.id}`);
      const data = await response.json();
      setCompanyPosts(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load posts');
    }
  };

  const handleDeleteJob = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this job post? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Job deleted successfully');
          setCompanyJobs(prev => prev.filter(job => job.id !== id));
        } else {
          toast.error('Failed to delete job');
        }
      } catch (error) {
        console.error(error);
        toast.error('Server error');
      }
    }});
  };

  const handleDeletePost = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this advertisement? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/company-posts/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Advertisement deleted successfully');
          setCompanyPosts(prev => prev.filter(post => post.id !== id));
        } else {
          toast.error('Failed to delete post');
        }
      } catch (error) {
        console.error(error);
        toast.error('Server error');
      }
    }});
  };

  const handleEditJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      toast.info('Updating job...', { id: 'edit-job' });
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingJob)
      });
      if (response.ok) {
        toast.success('Job updated successfully!', { id: 'edit-job' });
        setEditingJob(null);
        fetchCompanyJobs();
      } else {
        toast.error('Failed to update job', { id: 'edit-job' });
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error', { id: 'edit-job' });
    }
  };

  const updateApplicationStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleApplicantSwipeRight = (applicant: any) => {
    updateApplicationStatus(applicant.id, 'accepted');
    setApplicants(prev => prev.filter(a => a.id !== applicant.id));
    toast.success(`Shortlisted ${applicant.name} for ${applicant.jobTitle}`);
  };

  const handleApplicantSwipeLeft = (applicant: any) => {
    updateApplicationStatus(applicant.id, 'rejected');
    setApplicants(prev => prev.filter(a => a.id !== applicant.id));
  };

  const handleDiscoverSwipeRight = (candidate: any) => {
    setSelectedCandidateModal(candidate);
  };

  const handleInviteConfirm = async () => {
    if (!selectedCandidateModal || !selectedCandidateModal.matchedJobId) return;
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          job_id: selectedCandidateModal.matchedJobId, 
          seeker_id: selectedCandidateModal.id, 
          status: 'pending', 
          message: inviteMessage 
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Invited ${selectedCandidateModal.name}! They have been added to your Applicants tab.`);
        setDiscoverCandidates(prev => prev.filter(c => c.id !== selectedCandidateModal.id));
        setSelectedCandidateModal(null);
        setInviteMessage('');
        fetchApplicants();
      } else {
        toast.error(data.message || 'Failed to invite');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error');
    }
  };



  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    if (croppedImageBlob) {
      formData.set('profile_picture', croppedImageBlob, 'profile_pic.jpg');
    }
    
    try {
      // 1. Update text data
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) throw new Error('Failed to update profile details');
      
      let updatedUser = { ...user, ...profileData };

      // 2. Upload files
      const profilePic = formData.get('profile_picture') as File;
      const banner = formData.get('banner') as File;

      if ((profilePic && profilePic.size > 0) || (banner && banner.size > 0)) {
        toast.info('Uploading files...', { id: 'uploading' });
        const fileRes = await fetch(`/api/users/${user.id}/uploads`, {
          method: 'POST',
          body: formData
        });
        const fileData = await fileRes.json();
        if (fileData.success) {
          updatedUser = fileData.user;
          toast.success('Files uploaded successfully!', { id: 'uploading' });
        } else {
          toast.error('File upload failed', { id: 'uploading' });
        }
      }

      toast.success('Profile saved!');
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCroppedImageBlob(null);
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(`Error saving: ${error.message || 'Server error'}`);
    } finally {
      setIsEditingProfile(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postCaption.trim() && !postMedia) {
      toast.error("Please provide a caption or media");
      return;
    }
    
    toast.info('Publishing post...', { id: 'create-post' });
    const formData = new FormData();
    formData.append('company_id', user.id);
    formData.append('caption', postCaption);
    formData.append('media_type', postMediaType);
    if (postMediaType === 'text') {
      formData.append('background_style', postBackgroundStyle);
      formData.append('text_position', postTextPosition);
    }
    if (postMedia) formData.append('media', postMedia);

    try {
      const res = await fetch('/api/company-posts', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        toast.success('Post published successfully!', { id: 'create-post' });
        setPostCaption('');
        setPostMedia(null);
        setPostMediaType('text');
        setMyContentMode('ads');
        setActiveTab('my_jobs');
      } else {
        toast.error('Failed to create post', { id: 'create-post' });
      }
    } catch (e) {
      toast.error('Server error', { id: 'create-post' });
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
      message: 'Are you sure you want to delete your company account? This action cannot be undone.',
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
    }});
  };

  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jobData = {
      company_id: user.id,
      title: formData.get('title'),
      department: formData.get('department'),
      location: formData.get('location'),
      type: formData.get('type'),
      salary: formData.get('salary'),
      description: formData.get('description'),
      requirements: formData.get('requirements'),
      skills: formData.get('skills')
    };

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Job created successfully!');
        e.currentTarget.reset();
        setActiveTab('discover');
      } else {
        toast.error('Failed to create job');
      }
        } catch (error) {
      console.error(error);
      toast.error('Server error');
    }
  };

  

  return (
    <div className="theme-company min-h-screen bg-[#030213] text-foreground flex flex-col h-screen overflow-hidden relative">
      
      {/* Animated Background Blobs & Particles */}
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
      </div>
      
      {/* Animated Background Blobs & Particles */}
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
      </div>
    
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
                  <button onClick={confirmCrop} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">Apply Crop</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Candidate View & Invite Modal */}
      <AnimatePresence>
        {selectedCandidateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#030213] border border-[#1E293B] shadow-[0_0_40px_rgba(255,102,178,0.2)] w-full max-w-2xl rounded-[40px] overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-[#1E293B] flex justify-between items-center bg-[#0B1120] sticky top-0 z-10">
                <h3 className="font-bold text-2xl font-heading text-white">Candidate Details</h3>
                <button onClick={() => setSelectedCandidateModal(null)} className="p-2 text-gray-400 hover:text-white hover:bg-[#111827] rounded-full transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-8 overflow-y-auto bg-[#030213]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
                  <div className="w-24 h-24 bg-[#0B1120] rounded-full border-[4px] border-[#FF66B2]/30 flex items-center justify-center text-3xl font-bold text-[#FF66B2] overflow-hidden shrink-0 shadow-[0_0_20px_rgba(255,102,178,0.2)]">
                    {selectedCandidateModal.profile_picture ? (
                      <img src={selectedCandidateModal.profile_picture.startsWith('http') ? selectedCandidateModal.profile_picture : `http://localhost:5000${selectedCandidateModal.profile_picture}`} alt={selectedCandidateModal.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedCandidateModal.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-heading text-white mb-2">{selectedCandidateModal.name}</h2>
                    <p className="text-[#FF66B2] font-bold text-[10px] uppercase tracking-widest mb-3">Match for: {selectedCandidateModal.matchedJobTitle}</p>
                    {selectedCandidateModal.matchScore && (
                      <span className="inline-block px-4 py-1.5 bg-[#111827] text-green-400 rounded-xl text-[10px] uppercase tracking-widest font-bold border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                        {selectedCandidateModal.matchScore}% Match
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-8 mb-8 bg-[#0B1120] p-6 rounded-3xl border border-[#1E293B]">
                  <div>
                    <h4 className="font-bold uppercase text-[10px] text-[#FF66B2] mb-3 tracking-widest">Contact Information</h4>
                    <div className="flex flex-col gap-2 text-sm text-gray-300">
                      <p><strong className="text-gray-400">Email:</strong> {selectedCandidateModal.email || selectedCandidateModal.seeker_email || 'Not provided'}</p>
                      <p><strong className="text-gray-400">Phone:</strong> {selectedCandidateModal.phone_number || selectedCandidateModal.seeker_phone || 'Not provided'}</p>
                      { (selectedCandidateModal.linkedin_link || selectedCandidateModal.seeker_linkedin) && (
                        <p>
                          <strong className="text-gray-400">LinkedIn:</strong>{' '}
                          <a href={(selectedCandidateModal.linkedin_link || selectedCandidateModal.seeker_linkedin).startsWith('http') ? (selectedCandidateModal.linkedin_link || selectedCandidateModal.seeker_linkedin) : `https://${selectedCandidateModal.linkedin_link || selectedCandidateModal.seeker_linkedin}`} target="_blank" rel="noreferrer" className="text-[#00F0FF] hover:underline">
                            View Profile
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-[10px] text-gray-500 mb-3 tracking-widest">About</h4>
                    <p className="text-gray-300 leading-relaxed text-sm">{selectedCandidateModal.bio || selectedCandidateModal.seekerBio || 'No bio provided.'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-[10px] text-gray-500 mb-3 tracking-widest">Education Level</h4>
                    <p className="text-gray-300 font-bold text-sm">{selectedCandidateModal.education_level || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-[10px] text-gray-500 mb-3 tracking-widest">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidateModal.skills ? selectedCandidateModal.skills.split(',').map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-[#111827] text-gray-300 rounded-lg text-[10px] uppercase tracking-widest font-bold border border-[#1E293B] shadow-sm">{s.trim()}</span>
                      )) : <span className="text-gray-400 text-sm italic">None</span>}
                    </div>
                  </div>
                </div>

                {activeTab === 'discover' || activeTab === 'rankings' ? (
                  <div className="bg-[#0B1120] p-6 rounded-3xl border border-[#1E293B]">
                    <h4 className="font-bold uppercase text-[10px] text-[#FF66B2] mb-3 tracking-widest">Send an Invitation Message</h4>
                    <textarea 
                      className="w-full p-4 rounded-xl border border-[#1E293B] bg-[#111827] text-white focus:outline-none focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2]/50 transition-all text-sm font-medium"
                      rows={4}
                      placeholder={`Hi ${selectedCandidateModal.name?.split(' ')[0]}, we'd love for you to apply to our ${selectedCandidateModal.matchedJobTitle} position...`}
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                    />
                  </div>
                ) : null}
              </div>
              
              <div className="p-6 border-t border-[#1E293B] bg-[#0B1120] sticky bottom-0 z-10 flex flex-wrap gap-3">
                <button onClick={() => setSelectedCandidateModal(null)} className="flex-1 py-4 rounded-xl border border-[#1E293B] font-bold hover:bg-[#111827] text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-[10px]">Cancel</button>
                {activeTab === 'discover' || activeTab === 'rankings' ? (
                  <button onClick={handleInviteConfirm} className="flex-[2] py-4 rounded-xl bg-[#FF66B2]/20 text-[#FF66B2] border border-[#FF66B2]/30 font-bold shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:bg-[#FF66B2]/30 transition-colors uppercase tracking-widest text-[10px]">Send Invite</button>
                ) : activeTab === 'applicants' ? (
                  <>
                    <button onClick={() => { handleApplicantSwipeLeft(selectedCandidateModal); setSelectedCandidateModal(null); }} className="flex-1 py-4 rounded-xl border border-red-500/30 text-red-400 bg-red-500/10 font-bold hover:bg-red-500/20 transition-colors flex justify-center items-center gap-2 uppercase tracking-widest text-[10px]">
                      <X size={16} /> Pass
                    </button>
                    <button onClick={() => { setSchedulingApplicant(selectedCandidateModal); setSelectedCandidateModal(null); }} className="flex-1 py-4 rounded-xl bg-[#FF66B2]/20 text-[#FF66B2] border border-[#FF66B2]/30 font-bold shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:bg-[#FF66B2]/30 transition-colors flex justify-center items-center gap-2 flex uppercase tracking-widest text-[10px]">
                      <Users size={16} /> Interview
                    </button>
                    <button onClick={() => { handleApplicantSwipeRight(selectedCandidateModal); setSelectedCandidateModal(null); }} className="flex-1 py-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-bold hover:bg-green-500/30 transition-colors flex justify-center items-center gap-2 uppercase tracking-widest text-[10px]">
                      <Check size={16} /> Shortlist
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[#0B1120] border-b border-[#1E293B] h-[70px] flex items-center justify-between px-8 shrink-0 z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="HireQuest" className="w-10 h-10 object-contain filter drop-shadow-[0_0_10px_rgba(255,102,178,0.5)]" />
          <span className="font-heading font-bold text-2xl hidden sm:block tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FF66B2] to-white animate-text-shine">HireQuest</span> <span className="text-[10px] font-bold text-[#FF66B2] bg-[#FF66B2]/10 px-2 py-1 rounded-[23px] ml-1 uppercase tracking-wider align-middle border border-[#FF66B2]/20 text-white">Employer</span></span>
        </div>
        <nav className="flex items-center gap-2 p-2 bg-[#030213] rounded-[23px] shadow-sm border border-[#1E293B] overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button onClick={() => setActiveTab('discover')} className={`px-5 py-2 text-sm font-bold rounded-[23px] transition-all whitespace-nowrap ${activeTab === 'discover' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Discover</button>
          <button onClick={() => setActiveTab('rankings')} className={`px-5 py-2 text-sm font-bold rounded-[23px] transition-all whitespace-nowrap ${activeTab === 'rankings' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Rankings</button>
          <button onClick={() => setActiveTab('applicants')} className={`relative px-5 py-2 text-sm font-bold rounded-[23px] transition-all whitespace-nowrap ${activeTab === 'applicants' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>
            Applicants
            {applicants.some(a => a.status === 'pending') && <span className="absolute top-0.5 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#030213]"></span>}
          </button>
          <button onClick={() => setActiveTab('interviews')} className={`px-5 py-2 text-sm font-bold rounded-[23px] transition-all whitespace-nowrap ${activeTab === 'interviews' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Interviews</button>
          <button onClick={() => setActiveTab('matches')} className={`relative px-5 py-2 text-sm font-bold rounded-[23px] transition-all whitespace-nowrap ${activeTab === 'matches' ? 'bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)] border border-green-500/30' : 'text-gray-400 hover:text-green-400'}`}>
            Matches 🎉
            {applicants.some(a => a.status === 'accepted' && a.unreadCount > 0) && <span className="absolute top-0.5 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#030213]"></span>}
          </button>
          <button onClick={() => setActiveTab('my_jobs')} className={`px-5 py-2 text-sm font-bold rounded-[23px] transition-all whitespace-nowrap ${activeTab === 'my_jobs' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>My Content</button>
          <button onClick={() => setActiveTab('create_job')} className={`px-5 py-2 text-sm font-bold rounded-[23px] transition-all whitespace-nowrap ${activeTab === 'create_job' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Create Post</button>
          <button onClick={() => setActiveTab('profile')} className={`px-5 py-2 text-sm font-bold rounded-[23px] transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Profile</button>
        </nav>
        <div className="w-12 h-12 shrink-0 bg-[#111827] rounded-full flex items-center justify-center text-[#FF66B2] font-bold uppercase overflow-hidden border-2 border-[#FF66B2]/50 cursor-pointer shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:ring-2 hover:ring-[#FF66B2] hover:border-[#FF66B2] transition-all ml-2" onClick={() => setActiveTab('profile')}>
          {user.profile_picture ? (
            <img src={user.profile_picture?.startsWith('http') ? user.profile_picture : `http://localhost:5000${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            user.name ? user.name.substring(0, 2) : 'HQ'
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 flex overflow-hidden relative w-full h-full bg-transparent`}>
        {activeTab === 'discover' && (
          <div ref={discoverScrollRef} className="w-full h-full overflow-y-auto pb-20 scrollbar-thin">
            <div className="relative w-full overflow-hidden bg-transparent text-white pb-12" style={{ backgroundImage: 'linear-gradient(rgba(255,102,178,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,178,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030213]"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs md:text-sm font-bold mb-3 tracking-[0.2em] text-[#FF66B2] uppercase neon-text">Discover</h2>
                <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter text-white">FIND TOP TALENT</h1>
                <p className="text-[#94A3B8] max-w-2xl text-sm md:text-base font-medium mb-10">AI-matched candidates ranked by fit for your job requirements.</p>
                
                {/* Search Bar */}
                <div className="w-full max-w-2xl relative z-10 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-[#FF66B2] transition-colors" size={20} />
                  </div>
                  <input
                    type="text"
                    value={discoverSearchQuery}
                    onChange={(e) => setDiscoverSearchQuery(e.target.value)}
                    placeholder="Search candidates by skills (e.g., React, Design) or name..."
                    className="w-full pl-12 pr-4 py-4 bg-[#111827] border border-[#1E293B] rounded-[23px] text-white placeholder-gray-500 focus:outline-none focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="max-w-[1400px] mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10">
              {(() => {
                const filteredCandidates = discoverCandidates.filter(c => {
                  if (!discoverSearchQuery) return true;
                  const q = discoverSearchQuery.toLowerCase();
                  return (
                    (c.skills && c.skills.toLowerCase().includes(q)) ||
                    (c.bio && c.bio.toLowerCase().includes(q)) ||
                    (c.name && c.name.toLowerCase().includes(q)) ||
                    (c.education_level && c.education_level.toLowerCase().includes(q))
                  );
                });
                
                return !loading && filteredCandidates.length > 0 ? (
                  <div className="flex flex-col gap-10 py-8 w-full mt-6">
                  {filteredCandidates.map((candidate) => {
                  return (
                    <CandidateFeedBlock 
                      key={`${candidate.id}-${candidate.matchedJobId}`}
                      candidate={candidate}
                      fetchingReasonId={fetchingReasonId}
                      fetchAiReason={fetchAiReason}
                      aiReasons={aiReasons}
                      onExploreCandidate={setSelectedCandidateModal}
                      onInvite={handleDiscoverSwipeRight}
                    />
                  );
                })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-[23px] shadow-sm border border-gray-100 h-[60vh] mt-6">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                        <Users className="text-[#afafaf]" size={40} />
                      </div>
                      <h3 className="text-3xl font-bold font-heading mb-3 text-[#2a2a2a]">{loading ? 'Loading...' : 'No matches found'}</h3>
                      <p className="text-[#afafaf] mb-8 max-w-md text-lg">{discoverSearchQuery ? 'No candidates match your search query.' : 'Create more jobs or check back later to discover new talent.'}</p>
                      {discoverSearchQuery ? (
                        <button onClick={() => setDiscoverSearchQuery('')} className="px-10 py-3 bg-gray-200 text-gray-700 rounded-[23px] font-bold hover:bg-gray-300 transition-colors shadow-sm">Clear Search</button>
                      ) : (
                        <button onClick={fetchDiscoverCandidates} className="px-10 py-3 bg-[#22b3c1] text-white rounded-[23px] font-bold hover:bg-[#1d97a3] transition-colors shadow-md">Refresh Matches</button>
                      )}
                    </div>
                  );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'applicants' && (
          <div className="w-full h-full overflow-y-auto pb-20 scrollbar-thin bg-transparent">
            <div className="relative w-full overflow-hidden bg-transparent text-white pb-12" style={{ backgroundImage: 'linear-gradient(rgba(255,102,178,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,178,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030213]"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs font-bold mb-3 uppercase tracking-widest text-[#FF66B2] neon-text">Review candidates who applied</h2>
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Applicants</h1>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#030213] rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#1E293B] flex flex-col min-h-[50vh] overflow-hidden">
              <div className="p-6 border-b border-[#1E293B] flex justify-end bg-[#0B1120] rounded-t-[40px]">
                <div className="flex bg-[#111827] border border-[#1E293B] rounded-[23px] p-1 shadow-inner">
                  <button onClick={() => setApplicantView('pending')} className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-[23px] transition-colors ${applicantView === 'pending' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Pending Review</button>
                  <button onClick={() => setApplicantView('history')} className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-[23px] transition-colors ${applicantView === 'history' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>History</button>
                </div>
              </div>

            {/* Job Filter Dropdown */}
            <div className="px-8 py-4 bg-[#0B1120] border-b border-[#1E293B] flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF66B2] uppercase tracking-wider">Filter by Job:</span>
              <select
                value={selectedApplicantJobFilter}
                onChange={(e) => setSelectedApplicantJobFilter(e.target.value)}
                className="ml-4 flex-1 max-w-xs px-4 py-2.5 rounded-[15px] border border-[#1E293B] bg-[#111827] text-sm font-bold text-white focus:outline-none focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] cursor-pointer shadow-sm hover:border-[#FF66B2]/30 transition-colors"
              >
                <option value="All">All Jobs</option>
                {Array.from(new Set([
                  ...companyJobs.map(job => job.title),
                  ...applicants.map(a => a.jobTitle || 'General Application')
                ])).map(jobTitle => (
                  <option key={`filter-opt-${jobTitle}`} value={jobTitle}>{jobTitle}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-transparent">
              {applicantView === 'pending' ? (
                <div className="w-full flex flex-col gap-10">
                    {!loading && applicants.filter(a => a.status === 'pending').length > 0 ? (
                      (Object.entries(
                        applicants.filter(a => a.status === 'pending').reduce((acc, applicant) => {
                          const jobKey = applicant.jobTitle || 'General Application';
                          if (!acc[jobKey]) acc[jobKey] = [];
                          acc[jobKey].push(applicant);
                          return acc;
                        }, {} as Record<string, any[]>)
                      ) as [string, any[]][]).filter(([jobTitle]) => selectedApplicantJobFilter === 'All' || jobTitle === selectedApplicantJobFilter).map(([jobTitle, jobApplicants]) => (
                        <div key={jobTitle} className="flex flex-col gap-6 mb-10 last:mb-0">
                          <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2 border-b border-[#1E293B] pb-3">
                            <Briefcase size={22} className="text-[#FF66B2]" /> {jobTitle}
                            <span className="text-[10px] uppercase tracking-widest bg-[#FF66B2]/10 text-[#FF66B2] border border-[#FF66B2]/30 px-3 py-1 rounded-[23px] font-bold ml-2">{jobApplicants.length} pending</span>
                          </h3>
                          <div className="flex flex-col gap-6">
                            {jobApplicants.map((applicant: any) => {
                              const mappedCandidate = {
                          ...applicant,
                          education_level: applicant.seekerEducation,
                          matchedJobTitle: applicant.jobTitle,
                          matchedJobId: applicant.job_id,
                          bio: applicant.seekerBio,
                          skills: applicant.seekerSkills,
                        };
                        
                        const customActions = (
                          <div className="flex flex-wrap items-center gap-2">
                            <button onClick={() => handleApplicantSwipeLeft(applicant)} className="px-4 py-2 rounded-[23px] border border-red-500/30 text-red-400 font-bold hover:bg-red-500/10 transition-colors flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.1)] bg-[#111827] text-xs uppercase tracking-widest">
                              <X size={16} /> Pass
                            </button>
                            <button onClick={() => setSchedulingApplicant(applicant)} className="px-4 py-2 rounded-[23px] bg-[#111827] text-white border border-[#FF66B2]/30 font-bold shadow-[0_0_10px_rgba(255,102,178,0.1)] hover:bg-[#1E293B] transition-colors flex items-center gap-1 text-xs uppercase tracking-widest">
                              <Users size={16} className="text-[#FF66B2]" /> Interview
                            </button>
                            <button onClick={() => handleApplicantSwipeRight(applicant)} className="px-4 py-2 rounded-[23px] bg-green-500/20 text-green-400 border border-green-500/30 font-bold shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:bg-green-500/30 transition-colors flex items-center gap-1 text-xs uppercase tracking-widest">
                              <Check size={16} /> Shortlist
                            </button>
                          </div>
                        );

                        return (
                          <CandidateFeedBlock
                            key={`app-${applicant.id}`}
                            candidate={mappedCandidate}
                            fetchingReasonId={fetchingReasonId}
                            fetchAiReason={fetchAiReason}
                            aiReasons={aiReasons}
                            onExploreCandidate={setSelectedCandidateModal}
                            customCardId={`app_${applicant.id}`}
                            seekerIdOverride={applicant.seeker_id}
                            customActions={customActions}
                          />
                        );
                      })}
                      </div>
                    </div>
                  ))
                ) : (
                      <div className="flex flex-col items-center justify-center text-center p-12 bg-[#0B1120] rounded-[40px] shadow-sm border border-[#1E293B] h-[60vh]">
                        <div className="w-24 h-24 bg-[#111827] rounded-full flex items-center justify-center mb-6 border border-[#334155] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                          <Search className="text-[#334155]" size={40} />
                        </div>
                        <h3 className="text-3xl font-bold font-heading mb-3 text-white">{loading ? 'Loading...' : 'No pending applicants'}</h3>
                        <p className="text-gray-400 mb-8 max-w-md text-lg">You have no pending applications to review right now.</p>
                        <button onClick={fetchApplicants} className="px-10 py-3 bg-[#FF66B2]/20 text-[#FF66B2] border border-[#FF66B2]/30 rounded-[23px] font-bold hover:bg-[#FF66B2]/30 hover:shadow-[0_0_20px_rgba(255,102,178,0.3)] transition-all shadow-[0_0_15px_rgba(255,102,178,0.2)]">Refresh</button>
                      </div>
                    )}
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {applicants.filter(a => a.status !== 'pending').length === 0 ? (
                    <div className="text-center mt-20 text-gray-500 font-bold uppercase tracking-widest text-sm">No applicant history.</div>
                  ) : (
                    (Object.entries(
                      applicants.filter(a => a.status !== 'pending').reduce((acc, applicant) => {
                        const jobKey = applicant.jobTitle || 'General Application';
                        if (!acc[jobKey]) acc[jobKey] = [];
                        acc[jobKey].push(applicant);
                        return acc;
                      }, {} as Record<string, any[]>)
                    ) as [string, any[]][]).filter(([jobTitle]) => selectedApplicantJobFilter === 'All' || jobTitle === selectedApplicantJobFilter).map(([jobTitle, jobApplicants]) => (
                      <div key={jobTitle} className="flex flex-col gap-6 mb-10 last:mb-0">
                        <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2 border-b border-[#1E293B] pb-3">
                          <Briefcase size={22} className="text-[#FF66B2]" /> {jobTitle}
                          <span className="text-[10px] uppercase tracking-widest bg-[#111827] text-gray-400 border border-[#1E293B] px-3 py-1 rounded-[23px] font-bold ml-2">{jobApplicants.length} reviewed</span>
                        </h3>
                        <div className="flex flex-col gap-6">
                          {jobApplicants.map((applicant: any) => {
                            const mappedCandidate = {
                        ...applicant,
                        education_level: applicant.seekerEducation,
                        matchedJobTitle: applicant.jobTitle,
                        matchedJobId: applicant.job_id,
                        bio: applicant.seekerBio,
                        skills: applicant.seekerSkills,
                      };
                      const statusBadge = (
                        <div className="flex gap-3 pt-4 border-t border-[#1E293B] w-full justify-end">
                          <span className={`px-5 py-2.5 rounded-[23px] text-[10px] font-bold tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)] uppercase ${applicant.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                            {applicant.status === 'accepted' ? 'Shortlisted' : 'Passed'}
                          </span>
                        </div>
                      );
                      return (
                        <CandidateFeedBlock
                          key={`hist-${applicant.id}`}
                          candidate={mappedCandidate}
                          fetchingReasonId={fetchingReasonId}
                          fetchAiReason={fetchAiReason}
                          aiReasons={aiReasons}
                          onExploreCandidate={setSelectedCandidateModal}
                          customCardId={`hist_${applicant.id}`}
                          seekerIdOverride={applicant.seeker_id}
                          customActions={statusBadge}
                        />
                      );
                    })}
                    </div>
                  </div>
                ))
              )}
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="w-full h-full overflow-y-auto pb-20 scrollbar-thin bg-transparent">
            <div className="relative w-full overflow-hidden bg-transparent text-white pb-12" style={{ backgroundImage: 'linear-gradient(rgba(255,102,178,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,178,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030213]"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs font-bold mb-3 uppercase tracking-widest text-[#FF66B2] neon-text">Manage your upcoming and past interviews</h2>
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Interviews</h1>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#030213] rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#1E293B] flex flex-col min-h-[50vh] overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-transparent">
              {interviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 h-full">
                  <div className="w-20 h-20 bg-[#111827] rounded-full flex items-center justify-center mb-6 border border-[#334155] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <Users className="text-[#334155]" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-2 text-white">No Interviews</h3>
                  <p className="text-gray-400 max-w-md">You haven't scheduled any interviews yet. Go to the Applicants tab to schedule one.</p>
                </div>
              ) : (
                interviews.map(interview => (
                  <div key={interview.id} className="bg-[#0B1120] p-6 rounded-[23px] border border-[#1E293B] shadow-[0_0_15px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row justify-between gap-6 hover:shadow-[0_0_20px_rgba(255,102,178,0.1)] hover:border-[#FF66B2]/30 transition-all">
                    <div className="flex gap-5">
                      <div className="w-16 h-16 bg-[#FF66B2]/10 rounded-[15px] flex items-center justify-center text-2xl font-bold text-[#FF66B2] shrink-0 uppercase overflow-hidden border border-[#FF66B2]/30 shadow-[0_0_10px_rgba(255,102,178,0.2)]">
                        {interview.seeker_picture ? (
                          <img src={interview.seeker_picture.startsWith('http') ? interview.seeker_picture : `http://localhost:5000${interview.seeker_picture}`} alt={interview.seeker_name} className="w-full h-full object-cover" />
                        ) : (
                          interview.seeker_name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white">{interview.seeker_name}</h3>
                        <p className="text-[#FF66B2] text-[10px] uppercase tracking-widest font-bold mb-2">{interview.job_title}</p>
                        <div className="flex flex-col gap-1 text-sm text-gray-300">
                          <span className="font-bold">Date: <span className="text-white font-normal">{new Date(interview.scheduled_date).toLocaleString()}</span></span>
                          <span className="font-bold">Type: <span className="capitalize text-white font-normal">{interview.type}</span></span>
                          <span className="font-bold">Link/Location: <span className="text-[#FF66B2] font-normal break-all">{interview.link_or_location}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[140px]">
                      <span className={`px-4 py-1.5 rounded-xl text-center text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                        interview.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                        interview.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}>
                        {interview.status}
                      </span>
                      {interview.status === 'scheduled' && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                message: `Hire ${interview.seeker_name} after this interview? Their application will be marked as a Success.`,
                                onConfirm: async () => {
                                  await handleUpdateInterviewStatus(interview.id, 'completed');
                                  await updateApplicationStatus(interview.application_id, 'finished');
                                }
                              });
                            }} className="w-full py-2 bg-green-500/10 text-green-400 font-bold rounded-lg border border-green-500/30 hover:bg-green-500/20 transition-colors shadow-sm text-[10px] uppercase tracking-widest">
                              Hire Candidate
                            </button>
                            <button onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                message: `Reject ${interview.seeker_name} after this interview?`,
                                onConfirm: async () => {
                                  await handleUpdateInterviewStatus(interview.id, 'completed');
                                  await updateApplicationStatus(interview.application_id, 'rejected');
                                }
                              });
                            }} className="w-full py-2 bg-red-500/10 text-red-400 font-bold rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-colors shadow-sm text-[10px] uppercase tracking-widest">
                              Fail / Reject
                            </button>
                          </div>
                          <button onClick={() => handleUpdateInterviewStatus(interview.id, 'cancelled')} className="w-full py-2 bg-[#111827] text-gray-500 border border-gray-600/30 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-gray-600/20 transition-colors">
                            Cancel Interview
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rankings' && (
          <div className="w-full h-full overflow-y-auto pb-20 scrollbar-thin bg-transparent">
            <div className="relative w-full overflow-hidden bg-transparent text-white pb-12" style={{ backgroundImage: 'linear-gradient(rgba(255,102,178,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,178,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030213]"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs font-bold mb-3 uppercase tracking-widest text-[#FF66B2] neon-text">Ranked against your open jobs</h2>
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Top Candidate Matches</h1>
                {companyJobs.length > 0 && (
                  <div className="mt-6 flex items-center justify-center gap-3 relative z-20">
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Filter by Job:</span>
                    <select 
                      value={rankingJobFilter} 
                      onChange={(e) => setRankingJobFilter(e.target.value)}
                      className="bg-[#111827] border border-[#FF66B2]/30 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-[#FF66B2] focus:ring-1 focus:ring-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] font-bold cursor-pointer hover:bg-[#1E293B] transition-colors"
                    >
                      <option value="all">All Open Jobs</option>
                      {companyJobs.map((job, idx) => (
                        <option key={idx} value={job.title}>{job.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#030213] rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#1E293B] flex flex-col min-h-[50vh] overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10 bg-transparent">
              {loading ? (
                <div className="flex justify-center items-center h-full"><p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Calculating match scores...</p></div>
              ) : discoverCandidates.filter(c => c.matchScore >= 1 && (rankingJobFilter === "all" || c.matchedJobTitle === rankingJobFilter)).length === 0 ? (
                <div className="text-center mt-20 space-y-4">
                                    <div className="w-16 h-16 bg-[#111827] border border-[#334155] shadow-[0_0_15px_rgba(0,0,0,0.5)] rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-gray-500">0</div>
                  <h3 className="text-xl font-bold font-heading text-white">No Matches Found</h3>
                  <p className="text-gray-400">No candidates match your jobs above 0%.</p>
                </div>
              ) : (
                discoverCandidates.filter(c => c.matchScore >= 1 && (rankingJobFilter === "all" || c.matchedJobTitle === rankingJobFilter)).sort((a,b) => (b.matchScore || 0) - (a.matchScore || 0)).map((candidate, index) => (
                  <CandidateFeedBlock 
                    key={`${candidate.id}-${candidate.matchedJobId}`}
                    candidate={candidate}
                    fetchingReasonId={fetchingReasonId}
                    fetchAiReason={fetchAiReason}
                    aiReasons={aiReasons}
                    onExploreCandidate={setSelectedCandidateModal}
                    onInvite={handleDiscoverSwipeRight}
                    rank={index + 1}
                  />
                ))
              )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my_jobs' && (
          <div className="w-full h-full overflow-y-auto pb-20 scrollbar-thin bg-transparent">
            <div className="relative w-full overflow-hidden bg-transparent text-white pb-12" style={{ backgroundImage: 'linear-gradient(rgba(255,102,178,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,178,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030213]"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs font-bold mb-3 uppercase tracking-widest text-[#FF66B2] neon-text">Manage your job postings and advertisements</h2>
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">My Content</h1>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#030213] rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#1E293B] flex flex-col min-h-[50vh] overflow-hidden">
              <div className="p-6 border-b border-[#1E293B] flex justify-end bg-[#0B1120] rounded-t-[40px]">
                <div className="flex bg-[#111827] border border-[#1E293B] rounded-[23px] p-1 shadow-inner">
                  <button onClick={() => setMyContentMode('jobs')} className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-[23px] transition-colors ${myContentMode === 'jobs' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Jobs</button>
                  <button onClick={() => setMyContentMode('ads')} className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-[23px] transition-colors ${myContentMode === 'ads' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Advertisements</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent">
              {myContentMode === 'jobs' ? (
                editingJob ? (
                  <div className="bg-[#0B1120] p-8 rounded-3xl border border-[#1E293B] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#1E293B]">
                      <h3 className="text-2xl font-bold font-heading text-white">Edit Job: <span className="text-[#FF66B2]">{editingJob.title}</span></h3>
                      <button onClick={() => setEditingJob(null)} className="text-gray-400 hover:text-[#FF66B2] bg-[#111827] p-2 rounded-full transition-colors border border-[#1E293B]"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleEditJobSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold mb-2 text-[#FF66B2] uppercase tracking-widest">Job Title</label>
                          <input type="text" name="title" defaultValue={editingJob.title} onChange={e => setEditingJob({...editingJob, title: e.target.value})} required className="w-full px-5 py-3 rounded-xl border border-[#1E293B] bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-2 text-[#FF66B2] uppercase tracking-widest">Department</label>
                          <input type="text" name="department" defaultValue={editingJob.department} onChange={e => setEditingJob({...editingJob, department: e.target.value})} required className="w-full px-5 py-3 rounded-xl border border-[#1E293B] bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-2 text-[#FF66B2] uppercase tracking-widest">Location</label>
                          <input type="text" name="location" defaultValue={editingJob.location} onChange={e => setEditingJob({...editingJob, location: e.target.value})} required className="w-full px-5 py-3 rounded-xl border border-[#1E293B] bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-2 text-[#FF66B2] uppercase tracking-widest">Employment Type</label>
                          <select name="type" defaultValue={editingJob.type} onChange={e => setEditingJob({...editingJob, type: e.target.value})} className="w-full px-5 py-3 rounded-xl border border-[#1E293B] bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium">
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold mb-2 text-[#FF66B2] uppercase tracking-widest">Salary Range</label>
                          <input type="text" name="salary" defaultValue={editingJob.salary} onChange={e => setEditingJob({...editingJob, salary: e.target.value})} placeholder="e.g. RM 3,000 - RM 5,000" className="w-full px-5 py-3 rounded-xl border border-[#1E293B] bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-2 text-[#FF66B2] uppercase tracking-widest">Job Description</label>
                        <textarea name="description" defaultValue={editingJob.description} onChange={e => setEditingJob({...editingJob, description: e.target.value})} required rows={4} className="w-full px-5 py-3 rounded-xl border border-[#1E293B] bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium"></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-2 text-[#FF66B2] uppercase tracking-widest">Requirements</label>
                        <textarea name="requirements" defaultValue={editingJob.requirements} onChange={e => setEditingJob({...editingJob, requirements: e.target.value})} required rows={4} className="w-full px-5 py-3 rounded-xl border border-[#1E293B] bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium"></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-2 text-[#FF66B2] uppercase tracking-widest">Required Skills (Comma separated)</label>
                        <input type="text" name="skills" defaultValue={editingJob.skills} onChange={e => setEditingJob({...editingJob, skills: e.target.value})} placeholder="React, Node.js, TypeScript" className="w-full px-5 py-3 rounded-xl border border-[#1E293B] bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" />
                      </div>
                      <div className="flex gap-4 pt-6 border-t border-[#1E293B] mt-8">
                        <button type="button" onClick={() => setEditingJob(null)} className="flex-1 py-4 rounded-xl border border-[#1E293B] font-bold text-gray-400 uppercase tracking-widest hover:text-white hover:bg-[#111827] transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-[#FF66B2]/20 border border-[#FF66B2]/30 text-[#FF66B2] rounded-xl font-bold shadow-[0_0_15px_rgba(255,102,178,0.2)] uppercase tracking-widest hover:bg-[#FF66B2]/30 hover:shadow-[0_0_20px_rgba(255,102,178,0.3)] transition-colors">Save Changes</button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in max-w-3xl mx-auto">
                    {companyJobs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-12 bg-[#0B1120] rounded-[40px] shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-[#1E293B] mt-10">
                        <div className="w-24 h-24 bg-[#FF66B2]/10 border border-[#FF66B2]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,102,178,0.15)]">
                          <Briefcase className="text-[#FF66B2]" size={40} />
                        </div>
                        <h3 className="text-3xl font-bold font-heading mb-3 text-white">No jobs posted</h3>
                        <p className="text-gray-400 mb-8 max-w-md text-lg">You haven't posted any jobs yet. Create your first job posting to start discovering talent.</p>
                        <button onClick={() => {setActiveTab('create_job'); setCreateMode('job');}} className="px-10 py-4 bg-[#FF66B2]/20 text-[#FF66B2] border border-[#FF66B2]/30 rounded-[23px] font-bold shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:bg-[#FF66B2]/30 hover:shadow-[0_0_20px_rgba(255,102,178,0.3)] uppercase tracking-widest transition-all">Create Job Post</button>
                      </div>
                    ) : (
                      companyJobs.map(job => (
                        <div key={job.id} className="bg-[#0B1120] p-8 rounded-3xl border border-[#1E293B] shadow-[0_0_15px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-[0_0_20px_rgba(255,102,178,0.1)] hover:border-[#FF66B2]/30 transition-all group">
                          <div>
                            <h3 className="text-xl font-bold font-heading text-white group-hover:text-[#FF66B2] transition-colors">{job.title}</h3>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold tracking-widest uppercase">Posted {formatTimeAgo(job.created_at)}</p>
                            <div className="flex flex-wrap gap-2 mt-4 text-[10px] uppercase tracking-widest">
                              <span className="bg-[#111827] text-gray-300 px-3 py-1.5 rounded-lg font-bold border border-[#1E293B]">{job.department}</span>
                              <span className="bg-[#111827] text-gray-300 px-3 py-1.5 rounded-lg font-bold border border-[#1E293B]">{job.type}</span>
                              <span className="bg-[#111827] text-gray-300 px-3 py-1.5 rounded-lg font-bold border border-[#1E293B]">{job.location}</span>
                              {job.salary && <span className="text-[#FF66B2] bg-[#FF66B2]/10 border border-[#FF66B2]/30 font-bold px-3 py-1.5 rounded-lg">{job.salary}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <button onClick={() => setEditingJob(job)} className="px-5 py-2.5 bg-[#111827] text-gray-300 hover:bg-[#FF66B2]/20 hover:text-[#FF66B2] hover:border-[#FF66B2]/30 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors border border-[#1E293B] shadow-sm flex items-center gap-2">
                               Edit
                            </button>
                            <button onClick={() => handleDeleteJob(job.id)} className="px-5 py-2.5 bg-[#111827] text-red-400 hover:bg-red-500/10 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors border border-red-500/30 shadow-sm flex items-center gap-2">
                               Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )
              ) : (
                  <div className="space-y-4 animate-in fade-in max-w-4xl mx-auto">
                    {companyPosts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-12 bg-[#0B1120] rounded-[40px] shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-[#1E293B] mt-10">
                        <div className="w-24 h-24 bg-[#FF66B2]/10 border border-[#FF66B2]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,102,178,0.15)]">
                          <Upload className="text-[#FF66B2]" size={40} />
                        </div>
                        <h3 className="text-3xl font-bold font-heading mb-3 text-white">No advertisements posted</h3>
                        <p className="text-gray-400 mb-8 max-w-md text-lg">Share your company culture or advertisements to job seekers.</p>
                        <button onClick={() => {setActiveTab('create_job'); setCreateMode('ad');}} className="px-10 py-4 bg-[#FF66B2]/20 text-[#FF66B2] border border-[#FF66B2]/30 rounded-[23px] font-bold shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:bg-[#FF66B2]/30 hover:shadow-[0_0_20px_rgba(255,102,178,0.3)] uppercase tracking-widest transition-all">Create Advertisement</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {companyPosts.map(post => (
                          <div key={post.id} onClick={() => setSelectedPostModal(post)} className={`rounded-[30px] shadow-[0_0_15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-all cursor-pointer ${post.media_type === 'text' ? 'h-72 border border-[#1E293B] hover:shadow-[0_0_20px_rgba(255,102,178,0.2)] hover:border-[#FF66B2]/50' : 'bg-[#0B1120] border border-[#1E293B] hover:border-[#FF66B2]/50 hover:shadow-[0_0_20px_rgba(255,102,178,0.2)]'} ${post.media_type === 'text' ? (post.background_style || 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500') : ''}`}>
                            {post.media_type === 'text' ? (
                              <div className={`p-8 flex-1 flex flex-col ${post.text_position || 'justify-center items-center text-center'} relative`}>
                                <p className={`font-bold font-heading line-clamp-6 leading-relaxed break-words text-xl ${post.background_style?.includes('white') ? 'text-[#0B1120] drop-shadow-sm' : 'text-white drop-shadow-md'}`}>
                                  {post.caption}
                                </p>
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                  <p className={`text-[10px] font-bold uppercase tracking-widest ${post.background_style?.includes('white') ? 'text-gray-500' : 'text-white/80'}`}>Posted {formatTimeAgo(post.created_at)}</p>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} 
                                    className={`p-2 rounded-full transition-colors border ${post.background_style?.includes('white') ? 'text-red-500 hover:bg-red-50 hover:border-red-200 border-transparent' : 'text-white hover:bg-white/20 border-white/20'}`}
                                    title="Delete Advertisement"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="h-56 bg-[#111827] relative border-b border-[#1E293B]">
                                  {post.media_type === 'image' ? (
                                    <img src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} alt="Post" className="w-full h-full object-cover" />
                                  ) : (
                                    <video src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} className="w-full h-full object-cover" controls />
                                  )}
                                  <div className="absolute top-3 right-3 bg-black/60 text-[#FF66B2] text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg tracking-widest backdrop-blur-sm border border-[#FF66B2]/30 shadow-[0_0_10px_rgba(255,102,178,0.2)]">{post.media_type}</div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col bg-[#0B1120]">
                                  <p className="text-gray-300 font-medium leading-relaxed mb-6 flex-1 text-lg line-clamp-3">"{post.caption}"</p>
                                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#1E293B]">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Posted {formatTimeAgo(post.created_at)}</p>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} 
                                      className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors border border-transparent hover:border-red-500/30"
                                      title="Delete Advertisement"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="w-full h-full overflow-y-auto pb-20 scrollbar-thin bg-transparent">
            <div className="relative w-full overflow-hidden bg-transparent text-white pb-12" style={{ backgroundImage: 'linear-gradient(rgba(255,102,178,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,178,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030213]"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs font-bold mb-3 uppercase tracking-widest text-[#FF66B2] neon-text">Contact these candidates to arrange an interview or extend an offer</h2>
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🎉 Hired / Matches</h1>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#030213] rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#1E293B] flex flex-col min-h-[50vh] overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-transparent">
              {loading ? (
                <div className="flex justify-center items-center h-40"><p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading matches...</p></div>
              ) : applicants.filter(a => a.status === 'accepted').length === 0 ? (
                <div className="text-center mt-20 space-y-4">
                  <div className="w-20 h-20 bg-[#111827] rounded-full flex items-center justify-center mx-auto text-3xl font-bold border border-[#334155] shadow-[0_0_15px_rgba(0,0,0,0.5)]">🎯</div>
                  <h3 className="text-2xl font-bold font-heading text-white">No Matches Yet</h3>
                  <p className="text-gray-400">Keep inviting candidates and reviewing applicants.</p>
                  <button onClick={() => setActiveTab('discover')} className="px-8 py-3 mt-4 bg-[#FF66B2]/20 text-[#FF66B2] rounded-[23px] font-bold shadow-[0_0_15px_rgba(255,102,178,0.2)] border border-[#FF66B2]/30 hover:bg-[#FF66B2]/30 transition-colors">Find Candidates</button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center bg-[#0B1120] p-4 rounded-2xl border border-[#1E293B]">
                    <div className="flex items-center gap-2">
                      <Filter size={18} className="text-[#FF66B2]" />
                      <span className="text-sm font-bold text-gray-300">Filter by Job</span>
                    </div>
                    <select
                      value={matchFilterJob}
                      onChange={(e) => setMatchFilterJob(e.target.value)}
                      className="bg-[#111827] text-white border border-[#1E293B] rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-[#FF66B2]"
                    >
                      <option value="All">All Jobs</option>
                      {Array.from(new Set(applicants.filter(a => a.status === 'accepted').map(a => a.jobTitle))).filter(Boolean).map(job => (
                        <option key={job as string} value={job as string}>{job as string}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {applicants.filter(a => a.status === 'accepted' && (matchFilterJob === 'All' || a.jobTitle === matchFilterJob)).map(app => {
                    const mappedCandidate = {
                      ...app,
                      education_level: app.seekerEducation,
                      matchedJobTitle: app.jobTitle,
                      matchedJobId: app.job_id,
                      bio: app.seekerBio,
                      skills: app.seekerSkills,
                    };
                    
                    return (
                      <div key={app.id} className="relative border border-[#1E293B] rounded-2xl flex flex-col transition-all bg-[#0B1120] overflow-hidden shadow-sm hover:shadow-[0_0_20px_rgba(255,102,178,0.1)] hover:border-[#FF66B2]/50 group">
                        {app.unreadCount > 0 && (
                          <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 bg-red-500/10 text-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)] border border-red-500/30" title="You have unread messages!">
                            <MessageSquare size={16} fill="currentColor" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0B1120] animate-pulse"></div>
                          </div>
                        )}
                        <div className="p-6 flex flex-col gap-4 relative z-10">
                          <div className="flex items-center gap-4">
                            <div onClick={() => setSelectedCandidateModal(mappedCandidate)} className="w-16 h-16 bg-[#111827] rounded-xl shadow-[0_0_10px_rgba(255,102,178,0.1)] flex items-center justify-center text-2xl font-bold text-[#FF66B2] border border-[#FF66B2]/30 uppercase overflow-hidden shrink-0 cursor-pointer group-hover:border-[#FF66B2] transition-all">
                              {app.profile_picture ? (
                                <img src={app.profile_picture.startsWith('http') ? app.profile_picture : `http://localhost:5000${app.profile_picture}`} alt={app.name || 'Candidate'} className="w-full h-full object-cover" />
                              ) : (
                                app.name ? app.name.charAt(0) : 'C'
                              )}
                            </div>
                            <div className="pr-8">
                              <h3 className="font-bold text-lg leading-tight text-white flex items-center gap-2 group-hover:text-[#FF66B2] transition-colors">
                                {app.name || 'Candidate'}
                              </h3>
                              <p className="text-[#94A3B8] font-medium text-sm inline-block mt-0.5">Matched for: {app.jobTitle}</p>
                            </div>
                          </div>
                          
                          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 mt-2">
                            <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider">Contact Options</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => setSelectedCandidateModal(mappedCandidate)} className="py-2.5 bg-[#1E293B] text-gray-300 border border-[#334155] hover:border-[#FF66B2]/30 hover:text-[#FF66B2] rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <User size={16} /> View Profile
                              </button>
                              <button onClick={() => openChat(app)} className="py-2.5 bg-[#FF66B2]/10 text-[#FF66B2] border border-[#FF66B2]/30 rounded-lg text-sm font-bold hover:bg-[#FF66B2]/20 transition-colors flex items-center justify-center gap-2">
                                <MessageSquare size={16} /> Message
                              </button>
                              {app.email ? (
                                <button onClick={() => setEmailModalData({ email: app.email, subject: `Interview Invitation for ${app.jobTitle}` })} className="py-2.5 bg-[#1E293B] text-gray-300 border border-[#334155] hover:border-[#FF66B2]/30 hover:text-[#FF66B2] rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                  <Mail size={16} /> Email
                                </button>
                              ) : (
                                <button disabled className="py-2.5 bg-[#1E293B] text-gray-500 border border-[#334155] rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-not-allowed">
                                  <Mail size={16} /> No Email
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setConfirmDialog({
                                    isOpen: true,
                                    message: `Mark conversation with ${app.name} as finished? They will be removed from your Matches view.`,
                                    onConfirm: async () => {
                                      await updateApplicationStatus(app.id, 'finished');
                                      setApplicants(prev => prev.filter(a => a.id !== app.id));
                                    }
                                  });
                                }}
                                className="col-span-2 py-2.5 bg-green-500/10 text-green-500 border border-green-500/30 rounded-lg text-sm font-bold hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={16} /> Finish & Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        <AnimatePresence>
          {chatModalApplication && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[#030213] w-full max-w-md h-[600px] flex flex-col rounded-[40px] shadow-[0_0_40px_rgba(255,102,178,0.2)] overflow-hidden border border-[#1E293B]">
                {/* Header */}
                <div className="p-6 border-b border-[#1E293B] bg-[#0B1120] text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FF66B2]/20 border border-[#FF66B2]/30 text-[#FF66B2] text-xl font-bold rounded-full flex items-center justify-center uppercase overflow-hidden shrink-0 shadow-[0_0_10px_rgba(255,102,178,0.2)]">
                      {chatModalApplication.profile_picture ? (
                        <img src={chatModalApplication.profile_picture.startsWith('http') ? chatModalApplication.profile_picture : `http://localhost:5000${chatModalApplication.profile_picture}`} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        chatModalApplication.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-white">{chatModalApplication.name}</h3>
                      <p className="text-[10px] font-bold text-[#FF66B2] uppercase tracking-widest">{chatModalApplication.jobTitle}</p>
                    </div>
                  </div>
                  <button onClick={() => setChatModalApplication(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <MessageSquare size={48} className="mb-4 text-gray-500" />
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No messages yet.<br/>Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages.map(msg => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                          <div className={`p-4 rounded-[23px] text-sm font-medium ${isMe ? 'bg-[#FF66B2]/20 text-white border border-[#FF66B2]/30 shadow-[0_0_10px_rgba(255,102,178,0.1)] rounded-tr-sm' : 'bg-[#111827] text-gray-300 border border-[#1E293B] shadow-[0_0_10px_rgba(0,0,0,0.3)] rounded-tl-sm'}`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 mt-1.5 px-2 uppercase tracking-widest">
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1E293B] bg-[#0B1120] flex gap-3 shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-5 py-3 bg-[#111827] rounded-xl border border-[#1E293B] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-sm font-medium text-white placeholder-gray-500"
                  />
                  <button type="submit" disabled={!newMessage.trim() || isSendingMsg} className="w-12 h-12 bg-[#FF66B2]/20 border border-[#FF66B2]/30 text-[#FF66B2] shadow-[0_0_10px_rgba(255,102,178,0.1)] rounded-xl flex items-center justify-center hover:bg-[#FF66B2]/30 hover:shadow-[0_0_15px_rgba(255,102,178,0.2)] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-all">
                    {isSendingMsg ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-0.5 mt-0.5" />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </AnimatePresence>

        {activeTab === 'create_job' && (
          <div className="w-full h-full overflow-y-auto pb-20 scrollbar-thin bg-transparent">
            <div className="relative w-full overflow-hidden bg-transparent text-white pb-12" style={{ backgroundImage: 'linear-gradient(rgba(255,102,178,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,178,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030213]"></div>
              <div className="relative p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <h2 className="text-xs font-bold mb-3 uppercase tracking-widest text-[#FF66B2] neon-text">Publish a new job or share an advertisement</h2>
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Create Content</h1>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto w-full sm:px-4 md:px-8 -mt-16 relative z-10 bg-[#030213] rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#1E293B] flex flex-col min-h-[50vh] overflow-hidden">
              <div className="p-6 border-b border-[#1E293B] flex justify-end bg-[#0B1120] rounded-t-[40px]">
                <div className="flex bg-[#111827] border border-[#1E293B] rounded-[23px] p-1 shadow-inner">
                  <button onClick={() => setCreateMode('job')} className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-[23px] transition-colors ${createMode === 'job' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Job Post</button>
                  <button onClick={() => setCreateMode('ad')} className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-[23px] transition-colors ${createMode === 'ad' ? 'bg-[#FF66B2]/20 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.15)] border border-[#FF66B2]/30' : 'text-gray-400 hover:text-[#FF66B2]'}`}>Advertisement</button>
                </div>
              </div>
              <div className="p-6 md:p-10 bg-[#030213]">
            {createMode === 'job' ? (
              <form onSubmit={handleCreateJob} className="space-y-6 animate-in fade-in">
                <div>
                  <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Job Title</label>
                  <input required name="title" className="w-full px-5 py-3 border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Department</label>
                    <input required name="department" className="w-full px-5 py-3 border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" placeholder="e.g. Engineering" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Location</label>
                    <input required name="location" className="w-full px-5 py-3 border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" placeholder="e.g. Remote, US" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Type</label>
                    <select required name="type" className="w-full px-5 py-3 border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium appearance-none">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Salary Range</label>
                    <input required name="salary" className="w-full px-5 py-3 border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" placeholder="e.g. $120k - $150k" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Description</label>
                  <textarea required name="description" rows={4} className="w-full px-5 py-3 border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" placeholder="Describe the role..."></textarea>
                </div>
                <div>
                  <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Requirements</label>
                  <textarea required name="requirements" rows={3} className="w-full px-5 py-3 border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" placeholder="List the requirements..."></textarea>
                </div>
                <div>
                  <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Required Skills <span className="text-xs normal-case font-medium opacity-70">(comma separated)</span></label>
                  <input name="skills" className="w-full px-5 py-3 border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium" placeholder="React, Node.js, TypeScript" />
                  <p className="text-[10px] uppercase tracking-widest text-[#FF66B2] font-bold mt-2 ml-1 bg-[#FF66B2]/10 border border-[#FF66B2]/30 inline-block px-3 py-1.5 rounded-lg shadow-sm">💡 These skills will be used to match candidates.</p>
                </div>
                <button type="submit" className="w-full py-4 bg-[#FF66B2]/20 border border-[#FF66B2]/30 text-[#FF66B2] rounded-xl font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:bg-[#FF66B2]/30 hover:shadow-[0_0_20px_rgba(255,102,178,0.3)] transition-all mt-8">
                  Publish Job
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreatePost} className="space-y-6 animate-in fade-in">
                <div>
                  <label className="text-[10px] font-bold mb-3 block text-[#FF66B2] uppercase tracking-widest">Media Type</label>
                  <div className="flex flex-wrap gap-4">
                    <label className={`flex items-center justify-center gap-2 cursor-pointer px-5 py-3 border rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest ${postMediaType === 'image' ? 'border-[#FF66B2] bg-[#FF66B2]/10 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.2)]' : 'border-[#1E293B] bg-[#111827] text-gray-400 hover:bg-[#1a2235]'}`}>
                      <input type="radio" name="media_type" value="image" checked={postMediaType === 'image'} onChange={() => setPostMediaType('image')} className="hidden" /> 🖼️ Image
                    </label>
                    <label className={`flex items-center justify-center gap-2 cursor-pointer px-5 py-3 border rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest ${postMediaType === 'video' ? 'border-[#FF66B2] bg-[#FF66B2]/10 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.2)]' : 'border-[#1E293B] bg-[#111827] text-gray-400 hover:bg-[#1a2235]'}`}>
                      <input type="radio" name="media_type" value="video" checked={postMediaType === 'video'} onChange={() => setPostMediaType('video')} className="hidden" /> 🎥 Video
                    </label>
                    <label className={`flex items-center justify-center gap-2 cursor-pointer px-5 py-3 border rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest ${postMediaType === 'text' ? 'border-[#FF66B2] bg-[#FF66B2]/10 text-[#FF66B2] shadow-[0_0_15px_rgba(255,102,178,0.2)]' : 'border-[#1E293B] bg-[#111827] text-gray-400 hover:bg-[#1a2235]'}`}>
                      <input type="radio" name="media_type" value="text" checked={postMediaType === 'text'} onChange={() => setPostMediaType('text')} className="hidden" /> 📝 Text Only
                    </label>
                  </div>
                </div>
                
                {postMediaType !== 'text' && (
                  <div>
                    <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Upload {postMediaType === 'image' ? 'Image' : 'Video'}</label>
                    <div className="border border-dashed border-[#1E293B] bg-[#111827] rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#1a2235] hover:border-[#FF66B2]/50 transition-all shadow-inner" onClick={() => document.getElementById('post-media-upload')?.click()}>
                      {postMedia ? (
                        <div className="text-[#FF66B2] font-bold text-sm bg-[#FF66B2]/10 px-4 py-2 rounded-xl border border-[#FF66B2]/20 shadow-[0_0_10px_rgba(255,102,178,0.1)]">Selected: {postMedia.name}</div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-[#0B1120] rounded-full flex items-center justify-center shadow-md mb-4 border border-[#1E293B]">
                            <Upload className="text-[#FF66B2]" size={32} />
                          </div>
                          <p className="text-white font-bold text-lg">Click to select a file</p>
                          <p className="text-gray-400 text-xs mt-1 font-medium tracking-wider uppercase">Supports {postMediaType === 'image' ? 'JPG, PNG' : 'MP4, WebM'}</p>
                        </>
                      )}
                      <input type="file" id="post-media-upload" accept={postMediaType === 'image' ? "image/*" : "video/*"} className="hidden" onChange={e => {
                        if (e.target.files && e.target.files[0]) setPostMedia(e.target.files[0]);
                      }} />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-[10px] font-bold mb-2 block text-[#FF66B2] uppercase tracking-widest">Caption / Text Content</label>
                  <textarea value={postCaption} onChange={e => setPostCaption(e.target.value)} rows={5} className="w-full px-5 py-4 border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all text-white font-medium shadow-inner" placeholder="Write something engaging..."></textarea>
                </div>

                {postMediaType === 'text' && (
                  <div className="space-y-6 bg-[#111827] border border-[#1E293B] rounded-3xl p-6 shadow-inner">
                    <h3 className="font-bold text-white flex items-center gap-2 mb-4 font-heading text-xl"><div className="w-3 h-3 bg-[#FF66B2] rounded-full shadow-[0_0_10px_rgba(255,102,178,0.8)]"></div> Design Text Post</h3>
                    <div>
                      <label className="text-[10px] font-bold mb-3 block text-gray-400 uppercase tracking-widest">Background Style</label>
                      <div className="flex flex-wrap gap-3">
                        {['bg-gradient-to-br from-purple-500 to-indigo-600', 'bg-gradient-to-tr from-pink-500 to-orange-400', 'bg-gradient-to-br from-cyan-400 to-blue-500', 'bg-gradient-to-bl from-green-400 to-emerald-600', 'bg-[#0B1120]', 'bg-[#111827]', 'bg-white'].map((bg) => (
                          <div 
                            key={bg} 
                            onClick={() => setPostBackgroundStyle(bg)}
                            className={`w-10 h-10 rounded-full cursor-pointer shadow-sm border-[3px] transition-all ${bg} ${postBackgroundStyle === bg ? 'border-[#FF66B2] scale-110 shadow-[0_0_15px_rgba(255,102,178,0.5)]' : 'border-transparent hover:scale-105 hover:border-gray-500'} ${bg === 'bg-white' ? 'border-gray-200' : ''}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold mb-3 block text-gray-400 uppercase tracking-widest">Text Position</label>
                      <div className="flex gap-3">
                         <button type="button" onClick={() => setPostTextPosition('justify-start items-center text-center pt-16')} className={`px-4 py-2 text-[10px] tracking-widest uppercase font-bold rounded-xl border transition-colors ${postTextPosition.includes('start') ? 'bg-[#FF66B2]/20 border-[#FF66B2]/50 text-[#FF66B2] shadow-[0_0_10px_rgba(255,102,178,0.2)]' : 'bg-[#0B1120] border-[#1E293B] text-gray-400 hover:bg-[#1a2235]'}`}>Top</button>
                         <button type="button" onClick={() => setPostTextPosition('justify-center items-center text-center')} className={`px-4 py-2 text-[10px] tracking-widest uppercase font-bold rounded-xl border transition-colors ${postTextPosition.includes('center') && !postTextPosition.includes('start') && !postTextPosition.includes('end') ? 'bg-[#FF66B2]/20 border-[#FF66B2]/50 text-[#FF66B2] shadow-[0_0_10px_rgba(255,102,178,0.2)]' : 'bg-[#0B1120] border-[#1E293B] text-gray-400 hover:bg-[#1a2235]'}`}>Center</button>
                         <button type="button" onClick={() => setPostTextPosition('justify-end items-center text-center pb-16')} className={`px-4 py-2 text-[10px] tracking-widest uppercase font-bold rounded-xl border transition-colors ${postTextPosition.includes('end') ? 'bg-[#FF66B2]/20 border-[#FF66B2]/50 text-[#FF66B2] shadow-[0_0_10px_rgba(255,102,178,0.2)]' : 'bg-[#0B1120] border-[#1E293B] text-gray-400 hover:bg-[#1a2235]'}`}>Bottom</button>
                      </div>
                    </div>
                    
                    {/* Live Preview Miniature */}
                    {postCaption && (
                      <div className="mt-4">
                         <label className="text-[10px] font-bold mb-2 block text-gray-400 uppercase tracking-widest">Live Preview</label>
                         <div className={`w-[200px] aspect-[4/5] rounded-3xl p-4 flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-[#1E293B] mx-auto ${postBackgroundStyle} ${postTextPosition}`}>
                            <p className={`font-bold font-heading line-clamp-6 break-words text-lg ${postBackgroundStyle === 'bg-white' ? 'text-[#0B1120]' : 'text-white drop-shadow-md'}`}>{postCaption}</p>
                         </div>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className="w-full py-4 bg-[#FF66B2]/20 text-[#FF66B2] border border-[#FF66B2]/30 rounded-xl font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:bg-[#FF66B2]/30 hover:shadow-[0_0_20px_rgba(255,102,178,0.3)] transition-all mt-8">
                  Publish Advertisement
                </button>
              </form>
            )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="w-full h-full bg-transparent overflow-y-auto">
            {/* Banner */}
            <div className="h-48 relative bg-cover bg-center overflow-hidden" style={user.banner ? { backgroundImage: `url(${user.banner.startsWith('http') ? user.banner : `http://localhost:5000${user.banner}`})` } : { backgroundImage: 'linear-gradient(to right, #FF66B2, #030213)' }}>
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            <div className="px-6 sm:px-12 pb-12 relative">
              {!isEditingProfile ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* Left Column - Sidebar */}
                  <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-center sm:items-start">
                    {/* Profile Picture */}
                    <div className="w-40 h-40 rounded-full border-[6px] border-[#030213] bg-[#0B1120] shadow-[0_0_20px_rgba(255,102,178,0.3)] flex items-center justify-center text-5xl font-bold text-[#FF66B2] relative z-10 overflow-hidden shrink-0 -mt-20 mb-4">
                      {user.profile_picture ? (
                        <img src={user.profile_picture?.startsWith('http') ? user.profile_picture : `http://localhost:5000${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user.name ? user.name.substring(0, 2).toUpperCase() : 'HQ'
                      )}
                    </div>

                    {/* Name & Title */}
                    <div className="text-center sm:text-left mb-6 w-full">
                      <h2 className="text-3xl font-bold font-heading text-white mb-1 drop-shadow-md">{user.name}</h2>
                      <p className="text-gray-400 font-medium text-sm flex items-center justify-center sm:justify-start gap-2 uppercase tracking-widest">
                        <Building size={14} className="text-[#FF66B2]" /> Company Profile
                      </p>
                    </div>

                    {/* Action Button */}
                    <button onClick={() => setIsEditingProfile(true)} className="w-full py-3 bg-[#111827] hover:bg-[#1a2235] text-gray-300 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm transition-colors border border-[#1E293B] mb-8 flex items-center justify-center gap-2">
                      Manage your account
                    </button>

                    {/* Details Sections */}
                    <div className="w-full space-y-8 bg-[#0B1120] p-6 rounded-3xl border border-[#1E293B] shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                      {/* ABOUT */}
                      <div>
                        <h3 className="text-[10px] font-bold text-[#FF66B2] uppercase tracking-widest mb-4">About</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                            <MapPin size={16} className="text-gray-500 shrink-0" />
                            <span>{user.location || 'Location not set'}</span>
                          </div>
                          {user.website_link && (
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-300 truncate">
                              <Globe size={16} className="text-gray-500 shrink-0" />
                              <a href={user.website_link} target="_blank" rel="noreferrer" className="text-[#FF66B2] hover:underline hover:text-[#FF66B2]/80 truncate">{user.website_link.replace(/^https?:\/\//, '')}</a>
                            </div>
                          )}
                          {user.linkedin_link && (
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-300 truncate">
                              <Linkedin size={16} className="text-gray-500 shrink-0" />
                              <a href={user.linkedin_link} target="_blank" rel="noreferrer" className="text-[#FF66B2] hover:underline hover:text-[#FF66B2]/80 truncate">LinkedIn Profile</a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CONTACT */}
                      <div>
                        <h3 className="text-[10px] font-bold text-[#FF66B2] uppercase tracking-widest mb-4">Contact</h3>
                        <div className="space-y-4">
                          {user.location && (
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                              <MapPin size={16} className="text-gray-500 shrink-0" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                            <Mail size={16} className="text-gray-500 shrink-0" />
                            <span className="truncate">{user.email || 'No email provided'}</span>
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                              <Phone size={16} className="text-gray-500 shrink-0" />
                              <span>{user.phone_number}</span>
                            </div>
                          )}
                          {user.website_link && (
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                              <Globe size={16} className="text-gray-500 shrink-0" />
                              <a href={user.website_link.startsWith('http') ? user.website_link : `https://${user.website_link}`} target="_blank" rel="noreferrer" className="truncate hover:text-[#FF66B2] hover:underline transition-colors">{user.website_link}</a>
                            </div>
                          )}
                          {user.linkedin_link && (
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                              <Linkedin size={16} className="text-gray-500 shrink-0" />
                              <a href={user.linkedin_link.startsWith('http') ? user.linkedin_link : `https://${user.linkedin_link}`} target="_blank" rel="noreferrer" className="truncate hover:text-[#FF66B2] hover:underline transition-colors">{user.linkedin_link}</a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TEAMS / PREFERENCES */}
                      <div>
                        <h3 className="text-[10px] font-bold text-[#FF66B2] uppercase tracking-widest mb-4">Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2"><Globe size={14}/> AI Insights Language</span>
                            <div className="flex bg-[#111827] p-1 rounded-xl border border-[#1E293B] shadow-inner">
                              <button onClick={() => setAiLanguage('en')} className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${aiLanguage === 'en' ? 'bg-[#FF66B2]/20 border border-[#FF66B2]/30 shadow-[0_0_10px_rgba(255,102,178,0.2)] text-[#FF66B2]' : 'text-gray-500 hover:text-white'}`}>English</button>
                              <button onClick={() => setAiLanguage('ms')} className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${aiLanguage === 'ms' ? 'bg-[#FF66B2]/20 border border-[#FF66B2]/30 shadow-[0_0_10px_rgba(255,102,178,0.2)] text-[#FF66B2]' : 'text-gray-500 hover:text-white'}`}>Melayu</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-[#1E293B] space-y-3">
                        <button onClick={handleSignOut} className="w-full py-3 bg-[#111827] text-gray-300 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#1a2235] transition-colors border border-[#1E293B] shadow-sm">
                          Sign Out
                        </button>
                        <button onClick={handleDeleteAccount} className="w-full py-3 bg-[#111827] text-red-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-colors border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Main Content */}
                  <div className="lg:col-span-8 xl:col-span-9 space-y-10 lg:pl-4 lg:pt-8">
                    
                    {/* Introduction Section */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4 drop-shadow-md">Company Overview</h3>
                      <div className="text-sm leading-relaxed text-gray-300 font-medium whitespace-pre-line bg-[#0B1120] p-6 rounded-2xl border border-[#1E293B] shadow-inner">
                        {user.bio || 'No company overview provided yet.'}
                      </div>
                    </div>

                    {/* Uploaded Documents Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white drop-shadow-md">Visual Assets & Branding</h3>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Only you and candidates can see this</span>
                      </div>
                      
                      <div className="bg-[#0B1120] rounded-2xl border border-[#1E293B] shadow-[0_0_15px_rgba(0,0,0,0.3)] overflow-hidden">
                        <div className="p-2">
                          {[
                            { key: 'profile_picture', label: 'Company Logo', icon: <ImageIcon size={18} className="text-[#FF66B2]" />, desc: 'Image Format • Uploaded', url: user.profile_picture },
                            { key: 'banner', label: 'Company Banner', icon: <ImageIcon size={18} className="text-[#FF66B2]" />, desc: 'Image Format • Uploaded', url: user.banner }
                          ].map((item, idx) => (
                            <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl transition-colors ${idx !== 0 ? 'border-t border-[#1E293B]' : ''} hover:bg-[#111827] group`}>
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#111827] flex items-center justify-center shadow-[0_0_10px_rgba(255,102,178,0.1)] border border-[#1E293B] group-hover:border-[#FF66B2]/30 transition-colors">
                                  {item.icon}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white mb-0.5">{item.label}</h4>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{item.desc}</p>
                                </div>
                              </div>
                              {item.url ? (
                                <div className="flex items-center gap-3">
                                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-green-500/30">Uploaded</span>
                                  <a href={item.url.startsWith('http') ? item.url : `http://localhost:5000${item.url}`} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-widest font-bold text-[#FF66B2] hover:text-[#FF66B2]/80 transition-colors hover:underline">View</a>
                                  <button onClick={() => handleRemoveFile(item.key)} className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-white ml-2 transition-colors">Remove</button>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-500 italic uppercase tracking-widest">Not Uploaded</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="px-4 py-3 bg-[#111827] border-t border-[#1E293B] text-[10px] uppercase tracking-widest font-bold text-[#FF66B2] hover:bg-[#1a2235] cursor-pointer transition-colors text-center" onClick={() => setIsEditingProfile(true)}>
                          Upload new branding assets
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
                        <label className="text-[10px] font-bold mb-2 block uppercase tracking-widest text-[#FF66B2]">Company Name</label>
                        <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-5 py-4 text-base border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all font-medium text-white shadow-inner" required />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold mb-2 block uppercase tracking-widest text-[#FF66B2]">Email Address</label>
                        <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full px-5 py-4 text-base border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all font-medium text-white shadow-inner" required />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold mb-2 block uppercase text-[#FF66B2] tracking-widest">Location</label>
                        <input type="text" value={profileData.location} onChange={e => setProfileData({...profileData, location: e.target.value})} placeholder="e.g. Kuala Lumpur, Malaysia" className="w-full px-5 py-4 text-base border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all font-medium text-white shadow-inner" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold mb-2 block uppercase text-[#FF66B2] tracking-widest">Phone Number</label>
                        <input type="tel" value={profileData.phone_number} onChange={e => setProfileData({...profileData, phone_number: e.target.value})} placeholder="+60 12-345 6789" className="w-full px-5 py-4 text-base border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all font-medium text-white shadow-inner" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold mb-2 block uppercase text-[#FF66B2] tracking-widest">Website URL</label>
                        <input type="url" value={profileData.website_link} onChange={e => setProfileData({...profileData, website_link: e.target.value})} placeholder="https://www.company.com" className="w-full px-5 py-4 text-base border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all font-medium text-white shadow-inner" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold mb-2 block uppercase text-[#FF66B2] tracking-widest">LinkedIn URL</label>
                        <input type="url" value={profileData.linkedin_link} onChange={e => setProfileData({...profileData, linkedin_link: e.target.value})} placeholder="https://linkedin.com/company/name" className="w-full px-5 py-4 text-base border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all font-medium text-white shadow-inner" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold mb-2 block uppercase text-[#FF66B2] tracking-widest">Company Description</label>
                      <textarea rows={16} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} placeholder="Describe your company..." className="w-full px-5 py-4 text-base border border-[#1E293B] rounded-xl bg-[#111827] focus:border-[#FF66B2]/50 focus:ring-1 focus:ring-[#FF66B2] outline-none transition-all resize-none font-medium text-white shadow-inner"></textarea>
                    </div>
                  </div>

                  {/* Bottom Section - File Uploads */}
                  <div className="space-y-6 bg-[#0B1120] p-8 rounded-3xl border border-[#1E293B] shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white"><Upload className="text-[#FF66B2]"/> Upload Visual Assets</h3>
                    <p className="text-gray-400 mb-6 font-bold uppercase tracking-widest text-[10px]">Uploading a new file will overwrite your existing document of that type.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-[#111827] p-6 rounded-2xl border border-[#1E293B] shadow-[0_0_10px_rgba(0,0,0,0.3)]">
                        <label className="text-sm font-bold mb-4 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-white"><ImageIcon size={18} className="text-[#FF66B2]"/> Profile Logo</span>
                          {croppedImageBlob && <span className="text-[10px] uppercase tracking-widest font-bold bg-[#FF66B2]/10 text-[#FF66B2] border border-[#FF66B2]/30 px-3 py-1 rounded-lg">Cropped Ready</span>}
                        </label>
                        <input type="file" name="profile_picture" accept="image/*" onChange={handleProfileImageSelect} className="w-full text-sm font-medium text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border file:border-[#FF66B2]/30 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-[#FF66B2]/20 file:text-[#FF66B2] hover:file:bg-[#FF66B2]/30 hover:file:shadow-[0_0_15px_rgba(255,102,178,0.2)] cursor-pointer transition-colors" />
                      </div>
                      <div className="bg-[#111827] p-6 rounded-2xl border border-[#1E293B] shadow-[0_0_10px_rgba(0,0,0,0.3)]">
                        <label className="text-sm font-bold mb-4 flex items-center gap-2 text-white"><ImageIcon size={18} className="text-[#FF66B2]"/> Banner Image</label>
                        <input type="file" name="banner" accept="image/*" className="w-full text-sm font-medium text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border file:border-[#FF66B2]/30 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-[#FF66B2]/20 file:text-[#FF66B2] hover:file:bg-[#FF66B2]/30 hover:file:shadow-[0_0_15px_rgba(255,102,178,0.2)] cursor-pointer transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-6 pt-8">
                    <button type="submit" className="px-12 py-4 bg-[#FF66B2]/20 text-[#FF66B2] border border-[#FF66B2]/30 rounded-xl font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:bg-[#FF66B2]/30 hover:shadow-[0_0_20px_rgba(255,102,178,0.3)] transition-colors">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-12 py-4 bg-[#111827] text-gray-400 rounded-xl font-bold uppercase tracking-widest hover:text-white hover:bg-[#1a2235] transition-colors border border-[#1E293B] shadow-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Schedule Interview Modal */}
        {schedulingApplicant && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
            <div className="bg-[#0B1120] border border-[#1E293B] shadow-[0_0_30px_rgba(255,102,178,0.15)] rounded-3xl max-w-md w-full p-8 relative">
              <button 
                onClick={() => setSchedulingApplicant(null)}
                className="absolute top-4 right-4 p-2 bg-[#111827] text-gray-400 hover:text-white hover:bg-[#1a2235] rounded-full transition-colors border border-[#1E293B]"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold font-heading mb-2 text-white drop-shadow-md">Schedule Interview</h2>
              <p className="text-gray-400 mb-6 text-[10px] uppercase tracking-widest font-bold">Schedule an interview with <span className="font-bold text-[#FF66B2]">{schedulingApplicant.name}</span>.</p>
              
              <form onSubmit={handleScheduleInterview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#FF66B2] mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={interviewForm.date}
                      onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#1E293B] bg-[#111827] text-white focus:outline-none focus:border-[#FF66B2]/50 focus:ring-2 focus:ring-[#FF66B2]/20 transition-all font-medium shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#FF66B2] mb-1">Time</label>
                    <input 
                      type="time" 
                      required
                      value={interviewForm.time}
                      onChange={(e) => setInterviewForm({...interviewForm, time: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#1E293B] bg-[#111827] text-white focus:outline-none focus:border-[#FF66B2]/50 focus:ring-2 focus:ring-[#FF66B2]/20 transition-all font-medium shadow-inner"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#FF66B2] mb-1">Interview Type</label>
                  <select 
                    value={interviewForm.type}
                    onChange={(e) => setInterviewForm({...interviewForm, type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#1E293B] bg-[#111827] text-white focus:outline-none focus:border-[#FF66B2]/50 focus:ring-2 focus:ring-[#FF66B2]/20 transition-all font-medium shadow-inner"
                  >
                    <option value="online">Online (e.g., Google Meet, Zoom)</option>
                    <option value="in-person">In-Person (Office Location)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#FF66B2] mb-1">
                    {interviewForm.type === 'online' ? 'Meeting Link' : 'Location Address'}
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder={interviewForm.type === 'online' ? "https://meet.google.com/..." : "123 Main St, City"}
                    value={interviewForm.link}
                    onChange={(e) => setInterviewForm({...interviewForm, link: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#1E293B] bg-[#111827] text-white focus:outline-none focus:border-[#FF66B2]/50 focus:ring-2 focus:ring-[#FF66B2]/20 transition-all font-medium shadow-inner"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="submit" className="flex-1 py-4 bg-[#FF66B2]/20 text-[#FF66B2] border border-[#FF66B2]/30 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:bg-[#FF66B2]/30 transition-colors">
                    Confirm & Schedule
                  </button>
                </div>
              </form>
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
