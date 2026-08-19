import { MapPin, DollarSign, Briefcase } from 'lucide-react';

interface ParallaxJobCardHorizontalProps {
  job: any;
  formatTimeAgo: (date: string) => string;
  onViewCompany: (id: number) => void;
  onExploreJob: (job: any) => void;
  onSwipeLeft: (job: any) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export default function ParallaxJobCardHorizontal({ job, formatTimeAgo, onExploreJob }: ParallaxJobCardHorizontalProps) {
  return (
    <div 
      onClick={() => onExploreJob(job)}
      className="relative w-full overflow-hidden bg-[#0F172A] border border-[#1E293B] rounded-[24px] shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-[#00F0FF]/50 transition-all duration-300 cursor-pointer group flex flex-col md:flex-row min-h-[160px] transform hover:-translate-y-1"
    >
      {/* Background Graphic Left Side (Optional/Subtle) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111827] to-[#0F172A] z-0"></div>
      <div 
        className="absolute -right-20 top-0 w-64 h-full opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"
      >
        <div className="w-full h-[150%] bg-[#00F0FF] rounded-full transform rotate-45 -translate-y-1/4 shadow-[0_0_50px_#00F0FF]"></div>
      </div>

      {/* Match Badge */}
      {job.matchScore !== undefined && (
        <div className="absolute top-4 right-4 bg-[#00F0FF]/10 text-[#00F0FF] font-bold text-xs px-3 py-1 rounded-full z-10 border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.2)] flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse"></div>
          {job.matchScore}% Match
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-5 md:p-6 flex flex-col justify-center w-full">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold font-heading text-white group-hover:text-[#00F0FF] transition-colors leading-tight mb-2 pr-20 drop-shadow-md">{job.title}</h3>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#94A3B8] font-medium mb-4">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#00F0FF]" /> {job.location}</span>
              <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-[#00F0FF]" /> {job.salary}</span>
              <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-[#00F0FF]" /> {job.type}</span>
            </div>

            <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed opacity-90">
              {job.description}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#1E293B] flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {job.skills && job.skills.split(',').slice(0, 4).map((skill: string, i: number) => (
              <span key={i} className="px-2.5 py-1 bg-[#1E293B] text-[#94A3B8] border border-[#334155] rounded-md text-[10px] font-bold uppercase tracking-wider group-hover:border-[#00F0FF]/30 group-hover:text-[#00F0FF] transition-colors">{skill.trim()}</span>
            ))}
            {job.skills && job.skills.split(',').length > 4 && <span className="px-2.5 py-1 bg-[#1E293B] text-[#94A3B8] border border-[#334155] rounded-md text-[10px] font-bold uppercase tracking-wider">+{job.skills.split(',').length - 4}</span>}
          </div>
          <span className="text-xs font-bold text-gray-500 shrink-0 ml-4">{formatTimeAgo(job.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
