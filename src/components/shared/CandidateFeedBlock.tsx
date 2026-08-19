import { GraduationCap, FileText, FileCheck, Send, Info, MessageSquare } from 'lucide-react';

interface CandidateFeedBlockProps {
  candidate: any;
  fetchingReasonId: string | null;
  aiReasons: Record<string, string>;
  fetchAiReason: (seekerId: number, jobId: number, cardId: string) => void;
  onExploreCandidate: (candidate: any) => void;
  onInvite?: (candidate: any) => void;
  rank?: number;
  customActions?: React.ReactNode;
  customBottomContent?: React.ReactNode;
  customCardId?: string;
  seekerIdOverride?: number;
}

export default function CandidateFeedBlock({
  candidate,
  fetchingReasonId,
  aiReasons,
  fetchAiReason,
  onExploreCandidate,
  onInvite,
  rank,
  customActions,
  customBottomContent,
  customCardId,
  seekerIdOverride
}: CandidateFeedBlockProps) {
  const cardId = customCardId || `candidate-${candidate.id}`;
  const seekerId = seekerIdOverride || candidate.id;

  return (
    <div className="flex flex-col md:flex-row gap-8 bg-[#111827] rounded-[40px] p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-[#1E293B] shrink-0 overflow-hidden relative">
      
      {/* Left: Candidate Avatar (Big Circular Frame) */}
      <div className="w-full md:w-1/4 lg:w-1/5 flex flex-col items-center text-center space-y-4 border-b md:border-b-0 md:border-r border-[#1E293B] pb-6 md:pb-0 md:pr-8 shrink-0 relative">
        {rank !== undefined && (
          <div className="absolute top-0 left-0 md:-left-4 md:-top-4 w-10 h-10 bg-[#FF66B2]/20 text-[#FF66B2] rounded-full flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(255,102,178,0.3)] border border-[#FF66B2] z-10">
            #{rank}
          </div>
        )}
        <div 
          onClick={() => onExploreCandidate(candidate)} 
          className="w-32 h-32 md:w-40 md:h-40 bg-[#0B1120] rounded-full flex items-center justify-center font-bold text-5xl uppercase text-[#FF66B2] overflow-hidden shadow-[0_0_20px_rgba(255,102,178,0.2)] border-4 border-[#FF66B2]/30 cursor-pointer hover:border-[#FF66B2]/80 hover:shadow-[0_0_30px_rgba(255,102,178,0.4)] hover:scale-105 transition-all"
        >
          {candidate.profile_picture ? (
            <img src={candidate.profile_picture.startsWith('http') ? candidate.profile_picture : `http://localhost:5000${candidate.profile_picture}`} alt={candidate.name} className="w-full h-full object-cover" />
          ) : (
            candidate.name?.charAt(0) || 'U'
          )}
        </div>
        <div>
          <h3 className="font-bold text-2xl text-white">{candidate.name}</h3>
          {candidate.education_level && (
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 mt-2">
              <GraduationCap size={14} className="text-[#FF66B2]" /> {candidate.education_level}
            </p>
          )}
        </div>
        <button onClick={() => onExploreCandidate(candidate)} className="px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#FF66B2] bg-[#FF66B2]/10 rounded-xl hover:bg-[#FF66B2]/20 border border-[#FF66B2]/30 shadow-[0_0_10px_rgba(255,102,178,0.1)] transition-colors w-full mt-2">
          View Profile
        </button>
      </div>

      {/* Right: Candidate Details */}
      <div className="w-full md:w-3/4 lg:w-4/5 flex flex-col gap-8">
        
        {/* Top: Match & AI Insights */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <h4 className="font-bold text-[10px] text-[#FF66B2] neon-text uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF66B2] shadow-[0_0_10px_rgba(255,102,178,1)] animate-pulse"></span> Candidate Match
            </h4>
            
            <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
              {customActions}
              {candidate.matchScore !== undefined && (
                <div className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)] border ${candidate.matchScore >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/30' : candidate.matchScore >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                  {candidate.matchScore}% Match for: {candidate.matchedJobTitle}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[#0B1120] p-6 rounded-3xl border border-[#1E293B] flex flex-col gap-4 shadow-sm">
            {candidate.matchScore !== undefined && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (!aiReasons[cardId]) {
                      fetchAiReason(seekerId, candidate.matchedJobId, cardId);
                    }
                  }}
                  className="px-5 py-2.5 bg-[#FF66B2]/20 border border-[#FF66B2]/50 text-[#FF66B2] rounded-xl text-[10px] uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(255,102,178,0.2)] hover:bg-[#FF66B2]/30 hover:shadow-[0_0_20px_rgba(255,102,178,0.3)] transition-all flex items-center gap-2 w-fit"
                >
                  {fetchingReasonId === cardId ? (
                     <span className="animate-pulse">✨ Analyzing Match...</span>
                  ) : (
                     <span>✨ Ask AI Why They Match</span>
                  )}
                </button>
                {onInvite && (
                  <button 
                    onClick={() => onInvite(candidate)}
                    className="px-5 py-2.5 bg-[#111827] text-white border border-[#FF66B2]/30 rounded-xl text-[10px] uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(255,102,178,0.1)] hover:bg-[#1E293B] transition-all flex items-center gap-2 w-fit"
                  >
                    <Send size={14} className="text-[#FF66B2]" /> Invite to Apply
                  </button>
                )}
              </div>
            )}
            
            {aiReasons[cardId] && (
              <div className="mt-2 p-4 bg-[#FF66B2]/10 border border-[#FF66B2]/30 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF66B2] shadow-[0_0_10px_rgba(255,102,178,1)]"></div>
                <p className="text-sm font-medium leading-relaxed italic text-white">{aiReasons[cardId]}</p>
              </div>
            )}
          </div>
        </div>

        {customBottomContent}

        {/* Applicant Message */}
        {candidate.message && (
          <div className="bg-[#111827] p-6 rounded-3xl border border-blue-500/30 relative overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
            <h4 className="font-bold text-[10px] text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-3">
               <MessageSquare size={14} className="text-blue-400" /> Applicant's Message
            </h4>
            <p className="text-sm font-medium leading-relaxed italic text-white">"{candidate.message}"</p>
          </div>
        )}

        {/* Bottom: Skills & About */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-[#0B1120] border border-[#1E293B] p-6 rounded-3xl shadow-sm">
            <h4 className="font-bold text-[10px] text-[#FF66B2] neon-text uppercase tracking-widest flex items-center gap-2 mb-4">
               <Info size={14} className="text-[#FF66B2]" /> About & Skills
            </h4>
            {candidate.bio ? (
              <p className="text-sm leading-relaxed text-gray-300 mb-6">{candidate.bio}</p>
            ) : (
              <p className="text-sm leading-relaxed text-gray-500 italic mb-6">No bio provided.</p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {candidate.skills ? candidate.skills.split(',').map((skill: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[10px] uppercase tracking-widest font-bold text-[#FF66B2]">
                  {skill.trim()}
                </span>
              )) : (
                <span className="text-sm text-gray-500 italic">No skills listed</span>
              )}
            </div>
          </div>
          
          {(candidate.resume || candidate.certificate || (candidate.certificates && candidate.certificates.length > 0)) && (
            <div className="w-full md:w-1/3 bg-[#0B1120] border border-[#1E293B] p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h4 className="font-bold text-[10px] text-[#FF66B2] neon-text uppercase tracking-widest mb-2">Documents</h4>
              {candidate.resume && (
                <a href={candidate.resume.startsWith('http') ? candidate.resume : `http://localhost:5000${candidate.resume}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-[#111827] border border-[#1E293B] rounded-xl hover:border-[#FF66B2]/50 hover:bg-[#FF66B2]/5 transition-colors hover:shadow-[0_0_15px_rgba(255,102,178,0.1)] group">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1120] border border-[#1E293B] flex items-center justify-center text-[#FF66B2] shadow-sm group-hover:bg-[#FF66B2]/20 group-hover:border-[#FF66B2]/50 transition-colors">
                    <FileText size={16} />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest text-gray-300 group-hover:text-[#FF66B2]">View Resume</span>
                </a>
              )}
              {candidate.certificates && candidate.certificates.length > 0 ? candidate.certificates.map((cert: any, i: number) => (
                <a key={cert.id || i} href={cert.file_url.startsWith('http') ? cert.file_url : `http://localhost:5000${cert.file_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-[#111827] border border-[#1E293B] rounded-xl hover:border-[#FF66B2]/50 hover:bg-[#FF66B2]/5 transition-colors hover:shadow-[0_0_15px_rgba(255,102,178,0.1)] group" title={cert.title || `Certificate ${i + 1}`}>
                  <div className="w-10 h-10 rounded-xl bg-[#0B1120] border border-[#1E293B] flex items-center justify-center text-[#FF66B2] shadow-sm group-hover:bg-[#FF66B2]/20 group-hover:border-[#FF66B2]/50 transition-colors shrink-0">
                    <FileCheck size={16} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-xs uppercase tracking-widest text-gray-300 group-hover:text-[#FF66B2] truncate">{cert.title || `Certificate ${i + 1}`}</span>
                    {cert.issuer && <span className="text-[10px] text-gray-500 truncate">{cert.issuer}</span>}
                  </div>
                </a>
              )) : candidate.certificate && (
                <a href={candidate.certificate.startsWith('http') ? candidate.certificate : `http://localhost:5000${candidate.certificate}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-[#111827] border border-[#1E293B] rounded-xl hover:border-[#FF66B2]/50 hover:bg-[#FF66B2]/5 transition-colors hover:shadow-[0_0_15px_rgba(255,102,178,0.1)] group">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1120] border border-[#1E293B] flex items-center justify-center text-[#FF66B2] shadow-sm group-hover:bg-[#FF66B2]/20 group-hover:border-[#FF66B2]/50 transition-colors shrink-0">
                    <FileCheck size={16} />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest text-gray-300 group-hover:text-[#FF66B2]">Legacy Certificate</span>
                </a>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
