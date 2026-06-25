import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function StoreFrontierIcon({ className = "", size = 48 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        {/* Neon purple to blue gradient for the play icon and lines */}
        <linearGradient id="playGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" /> {/* purple-500 */}
          <stop offset="50%" stopColor="#8b5cf6" /> {/* violet-500 */}
          <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
        </linearGradient>
      </defs>

      {/* Speed / Motion lines on the left */}
      <g stroke="url(#playGradient)" strokeWidth="3.5" strokeLinecap="round" opacity="0.9">
        <line x1="32" y1="46" x2="42" y2="46" />
        <line x1="24" y1="56" x2="46" y2="56" strokeWidth="4" />
        <line x1="28" y1="66" x2="43" y2="66" />
        <line x1="36" y1="76" x2="44" y2="76" />
      </g>

      {/* Main Play-button Triangle with a modern gradient */}
      <path
        d="M 50 35 
           L 85 55 
           A 6 6 0 0 1 85 65 
           L 50 85 
           A 6 6 0 0 1 42 79 
           L 42 41 
           A 6 6 0 0 1 50 35 Z"
        stroke="url(#playGradient)"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="rgba(139, 92, 246, 0.04)"
      />

      {/* Shopping Cart Icon inside the Triangle */}
      <g stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Cart handle and basket path */}
        <path d="M 48 52 H 52 L 56 64 H 69 L 73 54 H 53" />
        {/* Wheels */}
        <circle cx="58" cy="69" r="2" fill="white" stroke="none" />
        <circle cx="67" cy="69" r="2" fill="white" stroke="none" />
      </g>
    </svg>
  );
}

export function StoreFrontierLogo({ className = "", size = 48, showTagline = true }: LogoProps & { showTagline?: boolean }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Icon */}
      <div className="relative p-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent pointer-events-none"></div>
        <StoreFrontierIcon size={size} />
      </div>

      {/* Text/Typography Block */}
      <div className="flex flex-col justify-center">
        <div className="flex flex-col leading-none">
          <span className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase">STORE</span>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent uppercase">
            FRONTIER
          </span>
        </div>
        {showTagline && (
          <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-[0.16em] mt-1 whitespace-nowrap">
            FAST FORWARD YOUR BUSINESS
          </span>
        )}
      </div>
    </div>
  );
}
