import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ParallaxPostCard from './ParallaxPostCard';
import ParallaxJobCardHorizontal from './ParallaxJobCardHorizontal';

interface CompanyFeedBlockProps {
  group: {
    company_id: number;
    companyName: string;
    companyLogo: string;
    posts: any[];
    jobs: any[];
  };
  formatTimeAgo: (date: string) => string;
  handleViewCompany: (id: number) => void;
  handleSwipeLeft: (item: any) => void;
  setSelectedJob: (job: any) => void;
  setSelectedPost: (post: any) => void;
  setAiReason: (reason: string | null) => void;
  setAiLearningRec: (rec: any | null) => void;
  discoverScrollRef: React.RefObject<HTMLDivElement>;
}

export default function CompanyFeedBlock({
  group,
  formatTimeAgo,
  handleViewCompany,
  handleSwipeLeft,
  setSelectedJob,
  setSelectedPost,
  setAiReason,
  setAiLearningRec,
  discoverScrollRef
}: CompanyFeedBlockProps) {
  const [postPage, setPostPage] = useState(0);
  const postsPerPage = 3;

  const visiblePosts = group.posts.slice(postPage * postsPerPage, (postPage + 1) * postsPerPage);
  const hasMorePosts = group.posts.length > (postPage + 1) * postsPerPage;

  const handleNextPosts = () => {
    if (hasMorePosts) {
      setPostPage(prev => prev + 1);
    } else {
      setPostPage(0); // loop back
    }
  };

  const handlePrevPosts = () => {
    if (postPage > 0) {
      setPostPage(prev => prev - 1);
    } else {
      // jump to last page
      const lastPage = Math.ceil(group.posts.length / postsPerPage) - 1;
      setPostPage(lastPage);
    }
  };

  const visibleJobs = group.jobs.slice(0, 3);
  const hasMoreJobs = group.jobs.length > 3;

  return (
    <div className="flex flex-col md:flex-row gap-8 bg-[#111827] rounded-3xl p-8 shadow-xl border border-[#1E293B] mb-10 overflow-hidden relative group hover:border-[#00F0FF]/30 transition-colors">
      
      {/* Left: Company Logo (Big Circular Frame) */}
      <div className="w-full md:w-1/4 lg:w-1/5 flex flex-col items-center text-center space-y-4 border-b md:border-b-0 md:border-r border-[#1E293B] pb-6 md:pb-0 md:pr-8 shrink-0 relative">
        <div className="absolute top-1/2 right-0 w-px h-1/2 bg-gradient-to-b from-transparent via-[#00F0FF]/20 to-transparent hidden md:block"></div>
        <div 
          onClick={() => handleViewCompany(group.company_id)} 
          className="w-32 h-32 md:w-40 md:h-40 bg-[#0B1120] rounded-full flex items-center justify-center font-bold text-5xl uppercase text-[#00F0FF] overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.15)] border-4 border-[#1E293B] cursor-pointer hover:border-[#00F0FF]/50 hover:scale-105 transition-all"
        >
          {group.companyLogo ? (
            <img src={group.companyLogo.startsWith('http') ? group.companyLogo : `http://localhost:5000${group.companyLogo}`} alt={group.companyName} className="w-full h-full object-cover" />
          ) : (
            group.companyName?.charAt(0) || 'C'
          )}
        </div>
        <h3 className="font-bold text-2xl text-white">{group.companyName}</h3>
        <button onClick={() => handleViewCompany(group.company_id)} className="px-6 py-2.5 text-sm font-bold text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-md hover:bg-[#00F0FF]/20 hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all w-full uppercase tracking-wider">
          View Company
        </button>
      </div>

      {/* Right: Posts and Jobs (Top & Bottom) */}
      <div className="w-full md:w-3/4 lg:w-4/5 flex flex-col gap-10">
        
        {/* Top: Advertisements */}
        {group.posts.length > 0 && (
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-sm text-[#afafaf] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Advertisements
            </h4>
            
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                {visiblePosts.map(post => (
                  <ParallaxPostCard 
                    key={`post-${post.id}`} 
                    post={post} 
                    formatTimeAgo={formatTimeAgo} 
                    onViewCompany={handleViewCompany} 
                    onExplorePost={setSelectedPost}
                    onSwipeLeft={handleSwipeLeft} 
                    scrollContainerRef={discoverScrollRef}
                  />
                ))}
              </div>
              
              {group.posts.length > 3 && (
                <div className="flex flex-col gap-2 shrink-0">
                  <button 
                    onClick={handlePrevPosts}
                    className="w-10 h-10 rounded-full bg-[#1E293B] hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50 text-gray-400 hover:text-[#00F0FF] flex items-center justify-center transition-colors shadow-sm border border-[#334155]"
                    title="Previous Advertisements"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={handleNextPosts}
                    className="w-10 h-10 rounded-full bg-[#1E293B] hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50 text-gray-400 hover:text-[#00F0FF] flex items-center justify-center transition-colors shadow-sm border border-[#334155]"
                    title="Next Advertisements"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom: Job Postings */}
        {group.jobs.length > 0 && (
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-sm text-[#afafaf] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22b3c1]"></span> Job Postings
            </h4>
            
            <div className="flex flex-col gap-4">
              {visibleJobs.map(job => (
                <div key={`job-${job.id}`} className="w-full">
                  <ParallaxJobCardHorizontal 
                    job={job} 
                    formatTimeAgo={formatTimeAgo} 
                    onViewCompany={handleViewCompany} 
                    onExploreJob={(j) => { setSelectedJob(j); setAiReason(null); setAiLearningRec(null); }} 
                    onSwipeLeft={handleSwipeLeft} 
                    scrollContainerRef={discoverScrollRef}
                  />
                </div>
              ))}
            </div>

            {hasMoreJobs && (
              <button onClick={() => handleViewCompany(group.company_id)} className="mt-4 px-6 py-3 bg-[#1E293B] hover:bg-[#00F0FF]/10 text-white hover:text-[#00F0FF] rounded-xl font-bold text-sm transition-colors border border-[#334155] hover:border-[#00F0FF]/30 shadow-sm self-start">
                See All Job Postings ({group.jobs.length})
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
