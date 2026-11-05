import React from 'react';
import { 
  Library, Radio, BookOpen, FileText, HelpCircle, 
  Network, BarChart3, Award, Sparkles, ChevronRight, 
  Headphones, Layers, Clock, ShieldCheck, Flame, Zap, UploadCloud,
  GraduationCap, LogIn, UserCheck
} from 'lucide-react';
import { LectureSession, UserProfile } from '../types';

export type AppView = 'library' | 'live' | 'review' | 'notes' | 'quiz' | 'map' | 'analytics' | 'login';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  selectedSession: LectureSession | null;
  currentUser?: UserProfile | null;
  isRecording?: boolean;
  onOpenAccuracy: () => void;
  onOpenScript: () => void;
  onOpenSummary: () => void;
  onOpenAudioUpload?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  selectedSession,
  currentUser,
  isRecording = false,
  onOpenAccuracy,
  onOpenScript,
  onOpenSummary,
  onOpenAudioUpload,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    {
      id: 'library',
      label: 'Lecture Library',
      icon: <Library className="w-4 h-4" />
    },
    {
      id: 'live',
      label: 'Live Capture Studio',
      icon: <Radio className={`w-4 h-4 ${isRecording ? 'text-red-400 animate-pulse' : ''}`} />,
      badge: isRecording ? 'REC' : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/40'
    },
    {
      id: 'review',
      label: 'Player & Transcript',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'notes',
      label: 'Structured Notes',
      icon: <FileText className="w-4 h-4" />,
      badge: 'Cornell',
      badgeColor: 'bg-cyan-400/15 text-cyan-glow border border-cyan-400/30'
    },
    {
      id: 'quiz',
      label: 'Interactive Quiz',
      icon: <HelpCircle className="w-4 h-4" />,
      badge: 'AI',
      badgeColor: 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30'
    },
    {
      id: 'map',
      label: 'Knowledge Map',
      icon: <Network className="w-4 h-4" />,
      badge: '3D',
      badgeColor: 'bg-[#05F292]/15 text-[#05F292] border border-[#05F292]/30'
    },
    {
      id: 'analytics',
      label: 'Learning Analytics',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'login',
      label: currentUser ? 'Classroom Profile' : 'Student Sign In',
      icon: <GraduationCap className="w-4 h-4 text-[#FACC15]" />,
      badge: currentUser ? 'Synced' : 'Login',
      badgeColor: currentUser ? 'bg-[#EAB308]/20 text-[#FACC15] border border-[#EAB308]/40' : 'bg-white/10 text-white'
    }
  ];

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 3D Glass Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A0F1A]/85 backdrop-blur-2xl border-r border-white/10
        flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-2xl
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top: Logo & Platform Identity with Mirror Bevel */}
        <div>
          <div className="p-5 border-b border-white/10 relative overflow-hidden">
            <div 
              onClick={() => handleNavClick('library')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D2FF] to-[#2563EB] text-slate-950 flex items-center justify-center font-extrabold shadow-3d-button transition-transform group-hover:scale-105 border border-white/40">
                <Headphones className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-base font-extrabold tracking-tight text-[#F1F5F9]">LectureLoop</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-glow border border-cyan-400/40">
                    BT-14
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Searchable Moments • 3D Studio
                </p>
              </div>
            </div>

            {/* Specular Mirror Gleam */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-cyan-glow/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Student Profile / Classroom Auth Status */}
          <div className="mx-3 mt-3 p-3 rounded-xl bg-gradient-to-r from-black/50 to-[#0F172A]/70 border border-[#EAB308]/40 shadow-sm">
            {currentUser ? (
              <div 
                onClick={() => handleNavClick('login')}
                className="flex items-center space-x-2.5 cursor-pointer group"
                title="Manage Student Account & Data Sync"
              >
                <img
                  src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=scholar'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-lg border border-[#EAB308] bg-white/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-[#F1F5F9] truncate group-hover:text-[#FACC15] transition-colors">
                      {currentUser.name}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full flex items-center justify-between text-left text-xs text-[#F1F5F9] group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EAB308]/20 border border-[#EAB308]/50 text-[#FACC15] flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[11px] text-white group-hover:text-[#FACC15] transition-colors">
                      Student Login
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Preserve & sync data
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#EAB308] group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Active Session Snippet with 3D Bevel */}
          {selectedSession && (
            <div className="mx-3 mt-3 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                <span>Active Track</span>
                <span className="w-2 h-2 rounded-full bg-[#05F292] animate-pulse" />
              </div>
              <div className="text-xs font-bold text-[#F1F5F9] truncate" title={selectedSession.title}>
                {selectedSession.title}
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-cyan-glow font-mono mt-0.5">
                <span>{selectedSession.subject}</span>
                <span>•</span>
                <span>{Math.floor(selectedSession.duration / 60)}m {selectedSession.duration % 60}s</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
              Core Modules
            </div>

            {navItems.map(item => {
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'btn-3d-cyan text-slate-950 font-bold shadow-3d-button scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-slate-950' : 'text-cyan-glow'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-slate-950/20 text-slate-950 border border-slate-950/30' 
                        : item.badgeColor || 'bg-white/10 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {onOpenAudioUpload && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <button
                onClick={() => {
                  onOpenAudioUpload();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-cyan-glow bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center space-x-3">
                  <UploadCloud className="w-4 h-4 text-cyan-glow" />
                  <span>Import Audio File</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-glow px-1.5 py-0.5 rounded">
                  MP3
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section: 3D Hackathon Glass Tools */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-[#0A0F1A]/95">
          <div className="px-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
            BT-14 Verification
          </div>

          <button
            onClick={onOpenAccuracy}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#05F292]/10 hover:bg-[#05F292]/20 text-[#05F292] border border-[#05F292]/30 text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
          >
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Evidence Hub</span>
            </div>
            <span className="font-mono text-[10px] bg-[#05F292]/20 px-1.5 py-0.5 rounded">50pts</span>
          </button>

          <button
            onClick={onOpenScript}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-cyan-glow" />
              <span>2-Min Lesson Script</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={onOpenSummary}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30 text-xs font-medium transition-all"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>5-Min Summary</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B5CF6]" />
          </button>
        </div>

      </aside>
    </>
  );
};
