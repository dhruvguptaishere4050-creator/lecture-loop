import React from 'react';
import { Activity, ShieldCheck, Volume2, Search, Cpu, Sparkles, Radio } from 'lucide-react';
import { LectureSession } from '../types';

interface LiveActivityHUDProps {
  session: LectureSession | null;
  isPlaying?: boolean;
  currentTime?: number;
  isRecording?: boolean;
  matchCount?: number;
}

export const LiveActivityHUD: React.FC<LiveActivityHUDProps> = ({
  session,
  isPlaying = false,
  currentTime = 0,
  isRecording = false,
  matchCount = 0
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-3d px-4 py-2.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-white/20">
      
      {/* Left: Real-Time Engine State */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {isRecording ? (
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>LIVE CAPTURE ACTIVE</span>
            </span>
          ) : isPlaying ? (
            <span className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-400/15 text-cyan-glow border border-cyan-400/30 font-mono font-bold">
              <span className="flex items-center space-x-0.5 h-3">
                <span className="wave-bar-cyan" style={{ animationDelay: '0.1s', width: '2px', height: '12px' }} />
                <span className="wave-bar-cyan" style={{ animationDelay: '0.3s', width: '2px', height: '16px' }} />
                <span className="wave-bar-cyan" style={{ animationDelay: '0.2s', width: '2px', height: '10px' }} />
              </span>
              <span>PLAYING @ {formatTime(currentTime)}</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05F292]" />
              <span>ENGINE READY</span>
            </span>
          )}
        </div>

        {session && (
          <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 text-[11px] font-mono">
            <span>Lecture:</span>
            <span className="text-[#F1F5F9] font-bold truncate max-w-[200px]">{session.title}</span>
            <span className="text-cyan-glow">• {session.subject}</span>
          </div>
        )}
      </div>

      {/* Right: Live Diagnostics Metrics */}
      <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
        {matchCount > 0 && (
          <div className="flex items-center space-x-1 text-cyan-glow bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/30">
            <Search className="w-3 h-3" />
            <span>{matchCount} Search Matches</span>
          </div>
        )}

        <div className="hidden md:flex items-center space-x-1.5">
          <Cpu className="w-3 h-3 text-[#8B5CF6]" />
          <span>Local Engine:</span>
          <span className="text-[#F1F5F9]">Zero Latency</span>
        </div>

        <div className="flex items-center space-x-1 text-[#05F292]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Offline Provenance</span>
        </div>
      </div>

    </div>
  );
};
