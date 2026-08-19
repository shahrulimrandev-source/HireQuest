import { MapPin, DollarSign } from 'lucide-react';

interface ParallaxJobCardProps {
  job: any;
  formatTimeAgo: (date: string) => string;
  onViewCompany: (id: number) => void;
  onExploreJob: (job: any) => void;
  onSwipeLeft: (job: any) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export default function ParallaxJobCard({ job, formatTimeAgo, onExploreJob }: ParallaxJobCardProps) {
  return (
    <div 
      onClick={() => onExploreJob(job)}
      className="relative w-full aspect-[4/5] bg-white rounded-[24px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Background Image without Parallax */}
      <div 
        style={{ 
          backgroundImage: job.companyBanner ? `url(${job.companyBanner.startsWith('http') ? job.companyBanner : `http://localhost:5000${job.companyBanner}`})` : 'linear-gradient(to bottom right, #22b3c1, #3b82f6)',
        }}
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors duration-300"></div>

      {/* Match Score Badge */}
      {job.matchScore !== undefined && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[#22b3c1] font-bold text-xs shadow-lg z-10 border border-white/20">
          {job.matchScore}% Match
        </div>
      )}

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-lg font-bold text-[#22b3c1] overflow-hidden shrink-0 border border-white/50">
            {job.companyLogo ? (
              <img src={job.companyLogo.startsWith('http') ? job.companyLogo : `http://localhost:5000${job.companyLogo}`} alt="Company Logo" className="w-full h-full object-cover" />
            ) : (
              job.companyName ? job.companyName.charAt(0) : 'C'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-white/90 truncate">{job.companyName}</h3>
            <p className="text-[10px] text-white/60 font-medium">{formatTimeAgo(job.created_at)}</p>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-heading text-white leading-tight mb-3 line-clamp-2 group-hover:text-[#22b3c1] transition-colors">{job.title}</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-white text-[11px] font-bold">
            <MapPin size={12} /> <span className="truncate max-w-[80px]">{job.location}</span>
          </span>
          <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-white text-[11px] font-bold">
            <DollarSign size={12} /> <span className="truncate max-w-[80px]">{job.salary}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
