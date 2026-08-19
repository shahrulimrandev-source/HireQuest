
interface ParallaxPostCardProps {
  post: any;
  formatTimeAgo: (date: string) => string;
  onViewCompany: (id: number) => void;
  onExplorePost?: (post: any) => void;
  onSwipeLeft: (post: any) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export default function ParallaxPostCard({ post, formatTimeAgo, onViewCompany, onExplorePost }: ParallaxPostCardProps) {
  const isTextOnly = post.media_type === 'text';
  const bgStyle = post.background_style || 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500';
  const textPos = post.text_position || 'justify-center items-center text-center';

  return (
    <div 
      onClick={() => onExplorePost ? onExplorePost(post) : onViewCompany(post.company_id)}
      className="relative w-full aspect-[4/5] bg-black rounded-[24px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="absolute top-3 left-3 z-20 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded-full backdrop-blur-sm border border-white/20 uppercase tracking-widest">
        Ad
      </div>
      
      {/* Background / Media */}
      {post.media_type === 'image' ? (
        <img 
          src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} 
          alt="Post" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
      ) : post.media_type === 'video' ? (
        <video 
          src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} 
          className="absolute inset-0 w-full h-full object-cover" 
          autoPlay 
          loop 
          muted 
          playsInline 
        />
      ) : (
        <div 
          className={`absolute inset-0 w-full h-full ${bgStyle}`}
        />
      )}

      {/* Gradient Overlay for Image/Video (Not strictly needed for text if text is well contrasted, but keeps consistency) */}
      {!isTextOnly && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent group-hover:from-black/100 transition-colors duration-300"></div>
      )}

      {/* Content */}
      {isTextOnly ? (
        // TEXT ONLY LAYOUT
        <div className={`absolute inset-0 w-full h-full p-6 flex flex-col z-10 ${textPos}`}>
           <p className={`font-bold font-heading text-lg sm:text-xl line-clamp-[10] break-words ${bgStyle === 'bg-white' ? 'text-[#2a2a2a]' : 'text-white'}`}>
             {post.caption}
           </p>
           
           {/* Company info at bottom left always */}
           <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm uppercase text-indigo-600 overflow-hidden shrink-0 border border-black/10 shadow-md">
                {post.companyLogo ? (
                  <img src={post.companyLogo.startsWith('http') ? post.companyLogo : `http://localhost:5000${post.companyLogo}`} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  post.companyName?.charAt(0) || 'C'
                )}
              </div>
              <div className="min-w-0 flex-1 drop-shadow-md">
                <h3 className={`font-bold text-xs leading-tight truncate ${bgStyle === 'bg-white' ? 'text-[#2a2a2a]' : 'text-white'}`}>{post.companyName}</h3>
                <p className={`text-[9px] font-medium ${bgStyle === 'bg-white' ? 'text-[#2a2a2a]/60' : 'text-white/80'}`}>{formatTimeAgo(post.created_at)}</p>
              </div>
           </div>
        </div>
      ) : (
        // IMAGE/VIDEO LAYOUT
        <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm uppercase text-indigo-600 overflow-hidden shrink-0 border border-white/30 shadow-md">
              {post.companyLogo ? (
                <img src={post.companyLogo.startsWith('http') ? post.companyLogo : `http://localhost:5000${post.companyLogo}`} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                post.companyName?.charAt(0) || 'C'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs text-white leading-tight truncate">{post.companyName}</h3>
              <p className="text-[9px] text-white/60 font-medium">{formatTimeAgo(post.created_at)}</p>
            </div>
          </div>
          
          <p className="text-white/90 text-xs sm:text-sm leading-snug line-clamp-3 group-hover:text-white transition-colors">
            {post.caption}
          </p>
        </div>
      )}
    </div>
  );
}
