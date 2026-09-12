import React, { useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';

interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  color?: string;
  onClick?: () => void;
  id?: string;
}

export const CardSpotlight: React.FC<CardSpotlightProps> = ({
  children,
  className = '',
  radius = 350,
  color = 'rgba(251, 191, 36, 0.2)', // Slightly brighter amber for a cuter glow
  onClick,
  id,
}) => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      id={id}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mouseX.set(-1000);
        mouseY.set(-1000);
      }}
      // THE MAGIC HAPPENS HERE: Soft rounded corners, inner shine, bouncy physics
      className={`group/spotlight relative overflow-hidden rounded-[2rem] transition-all duration-300 ease-out 
        border-2 border-white/50 dark:border-white/10 
        bg-gradient-to-b from-white/40 to-white/10 dark:from-white/10 dark:to-transparent 
        backdrop-blur-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]
        ${onClick ? 'cursor-pointer select-none touch-manipulation hover:shadow-[0_12px_30px_-10px_rgba(245,158,11,0.4)] hover:border-amber-300/80 hover:-translate-y-2 active:translate-y-0 active:scale-95 active:rotate-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent' : ''} 
        ${className}`}
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover/spotlight:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              ${color},
              transparent 80%
            )
          `,
        }}
      />
      
      {/* Content Wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};