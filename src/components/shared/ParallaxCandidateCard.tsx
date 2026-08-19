import { GraduationCap } from 'lucide-react';

interface ParallaxCandidateCardProps {
  candidate: any;
  fetchingReasonId: string | null;
  aiReasons: Record<string, string>;
  fetchAiReason: (seekerId: number, jobId: number, cardId: string) => void;
  onExploreCandidate: (candidate: any) => void;
  onSwipeLeft: (candidate: any) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export default function ParallaxCandidateCard({ 
  candidate, 
  fetchingReasonId, 
  aiReasons, 
  fetchAiReason, 
  onExploreCandidate 
}: ParallaxCandidateCardProps) {
  const cardId = `candidate-${candidate.id}`;

  return (
    <div 
      onClick={() => onExploreCandidate(candidate)}
      className="relative w-full aspect-[4/5] bg-white rounded-[24px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Background Banner without Parallax */}
      <div 
        style={{ 
          backgroundImage: candidate.banner ? `url(${candidate.banner.startsWith('http') ? candidate.banner : `http://localhost:5000${candidate.banner}`})` : 'linear-gradient(to bottom right, #8b5cf6, #3b82f6)',
        }}
        className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10 group-hover:from-black/100 transition-colors duration-300"></div>

      {/* Match Score Badge */}
      {candidate.matchScore !== undefined && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-purple-600 font-bold text-xs shadow-lg z-10 border border-white/20">
          {candidate.matchScore}% Match
        </div>
      )}

      {/* Profile Picture */}
      <div className="absolute top-4 left-4 z-10">
         <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden bg-white shadow-md">
            {candidate.profile_picture ? (
               <img src={candidate.profile_picture.startsWith('http') ? candidate.profile_picture : `http://localhost:5000${candidate.profile_picture}`} alt={candidate.name} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center font-bold text-lg text-purple-600 bg-purple-50">
                  {candidate.name.charAt(0)}
               </div>
            )}
         </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end z-10">
        <h2 className="text-xl font-bold font-heading text-white leading-tight mb-1 group-hover:text-purple-400 transition-colors">{candidate.name}</h2>
        <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium mb-3">
          <GraduationCap size={14} />
          <span className="truncate">{candidate.education_level || 'No Education Specified'}</span>
        </div>

        <div className="mb-4 space-y-2">
           <div className="flex items-center gap-2">
             <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">Skills</div>
           </div>
           <div className="flex flex-wrap gap-1.5 max-h-[40px] overflow-hidden">
             {candidate.skills ? candidate.skills.split(',').slice(0, 3).map((skill: string, i: number) => (
               <span key={i} className="bg-white/20 backdrop-blur-md border border-white/10 px-2 py-1 rounded-[6px] text-white text-[10px] font-bold whitespace-nowrap">
                 {skill.trim()}
               </span>
             )) : (
               <span className="text-white/50 text-[10px] italic">No skills listed</span>
             )}
             {candidate.skills && candidate.skills.split(',').length > 3 && (
               <span className="bg-white/10 backdrop-blur-md border border-white/5 px-2 py-1 rounded-[6px] text-white/70 text-[10px] font-bold">
                 +{candidate.skills.split(',').length - 3}
               </span>
             )}
           </div>
        </div>

        {candidate.matchScore !== undefined && (
           <div className="pt-3 border-t border-white/10 mt-2">
              <button 
                onClick={(e) => {
                   e.stopPropagation();
                   if (!aiReasons[cardId]) {
                     fetchAiReason(candidate.id, candidate.matchedJobId, cardId);
                   }
                }}
                className="w-full py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 backdrop-blur-sm shadow-sm"
              >
                {fetchingReasonId === cardId ? (
                   <span className="animate-pulse">✨ AI is analyzing...</span>
                ) : aiReasons[cardId] ? (
                   <span className="line-clamp-2 text-left text-[10px] font-medium leading-relaxed opacity-90 italic">"{aiReasons[cardId]}"</span>
                ) : (
                   <span>✨ View AI Match Reason</span>
                )}
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
