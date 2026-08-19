import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  isActive: boolean;
}

export function SwipeCard({ children, onSwipeRight, onSwipeLeft, isActive }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipeRight();
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 w-full h-full ${isActive ? 'z-10' : 'z-0 pointer-events-none'}`}
      style={{
        x: isActive ? x : 0,
        rotate: isActive ? rotate : 0,
        opacity: isActive ? opacity : 0,
        scale: isActive ? 1 : 0.95,
      }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      exit={{ 
        x: exitX, 
        opacity: 0,
        transition: { duration: 0.2 }
      }}
      whileDrag={{ scale: 1.05 }}
    >
      <div className="relative w-full h-full bg-card rounded-2xl shadow-xl border overflow-hidden flex flex-col">
        {children}
        
        {/* Swipe Indicators */}
        {isActive && (
          <motion.div 
            className="absolute top-8 right-8 border-4 border-green-500 text-green-500 rounded-xl px-4 py-1 font-bold text-2xl rotate-12 z-20"
            style={{ opacity: useTransform(x, [0, 50], [0, 1]) }}
          >
            LIKE
          </motion.div>
        )}
        {isActive && (
          <motion.div 
            className="absolute top-8 left-8 border-4 border-red-500 text-red-500 rounded-xl px-4 py-1 font-bold text-2xl -rotate-12 z-20"
            style={{ opacity: useTransform(x, [0, -50], [0, 1]) }}
          >
            NOPE
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
