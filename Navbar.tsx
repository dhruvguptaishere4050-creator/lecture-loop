import React from 'react';
import { 
  Headphones, Radio, Menu, Plus, RotateCcw, 
  Award, Sparkles, FileText, ChevronRight, Zap, UploadCloud,
  GraduationCap, UserCheck
} from 'lucide-react';
import { AppView } from './Sidebar';
import { UserProfile } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAccuracy: () => void;
  onOpenSummary: () => void;
  onOpenScript: () => void;
  onNewLecture: () => void;
  onResetBenchmark: () => void;
  onOpenAudioUpload?: () => void;
  onOpenLogin?: () => void;
  currentUser?: UserProfile | null;
  isRecording?: boolean;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAccuracy,
  onOpenSummary,
  onOpenScript,
  onNewLecture,
  onResetBenchmark,
  onOpenAudioUpload,
  onOpenLogin,
  currentUser,
  isRecording = false,
  onToggleMobileSidebar
}) => {
  const getViewTitle = (view: AppView) => {
    switch (view) {
      case 'library': return { title: 'Lecture Vault', sub: 'Saved Sessions & 20-Term Benchmarks' };
      case 'live': return { title: 'Live Capture Studio', sub: 'Acoustic Speech Recognition & Buffer' };
      case 'review': return { title: '3D Audio Scrubber & Transcript', sub: 'Synchronized Playback & Error Correction' };
      case 'notes': return { title: 'Structured Cornell Notes', sub: 'AI Synthesis & Equation Index' };
      case 'quiz': return { title: 'Concept Mastery Quiz', sub: 'Dynamic Assessment & Audio Timestamp Jump' };
      case 'map': return { title: '3D Semantic Knowledge Graph', sub: 'Interactive Concept Nodes & Relationships' };
      case 'analytics': return { title: 'Speech Cadence Telemetry', sub: 'WPM Speedometer & Model Confidence' };
      case 'login': return { title: 'Classroom Portal', sub: 'Student Authentication & Data Preservation' };
      default: return { title: 'LectureLoop', sub: 'AI Lecture Studio' };
    }
  };

  const { title, sub } = getViewTitle(currentView);

  return (
    <header className="sticky top-0 z-30 bg-[#080C14]/80 backdrop-blur-xl border-b border-white/10 h-16 flex items-center px-4 sm:px-6 shadow-md">
      <div className="w-full flex items-center justify-between">
        
        {/* Left: Mobile Menu Toggle & Breadcrumbs */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl bg-white/[0.05] text-cyan-glow hover:text-white border border-white/10 lg:hidden transition-colors"
            title="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-cyan-glow font-bold hidden sm:inline">LectureLoop</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
              <h1 className="text-sm sm:text-base font-extrabold text-[#F1F5F9] tracking-tight">
                {title}
              </h1>
              {isRecording && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>RECORDING</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {sub}
            </p>
          </div>
        </div>

        {/* Right: 3D Glossy Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onOpenAudioUpload && (
            <button
              onClick={onOpenAudioUpload}
              className="btn-3d-obsidian hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-glow border-cyan-400/40 hover:border-cyan-400"
              title="Import external audio file (.mp3, .wav, .m4a)"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import Audio</span>
            </button>
          )}

          {currentView !== 'live' && (
            <button
              onClick={onNewLecture}
              className="btn-3d-cyan inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-extrabold shadow-3d-button transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Record Live</span>
            </button>
          )}

          <button
            onClick={onResetBenchmark}
            title="Reset 20-Term Biology Photosynthesis Benchmark"
            className="btn-3d-obsidian hidden xl:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-glow" />
            <span>Reset Benchmark</span>
          </button>

          <button
            onClick={onOpenAccuracy}
            title="Open BT-14 50-Points Evaluation Evidence Report"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#05F292]/10 hover:bg-[#05F292]/20 text-[#05F292] border border-[#05F292]/30 text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BT-14 Evidence</span>
            <span className="sm:hidden font-mono text-[10px]">50pts</span>
          </button>

          {/* Classroom Login / Profile Pill */}
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                currentUser
                  ? 'bg-[#EAB308]/15 hover:bg-[#EAB308]/25 text-[#FACC15] border-[#EAB308]/40'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
              }`}
              title="Classroom Student Portal & Sync"
            >
              {currentUser ? (
                <>
                  <img
                    src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=scholar'}
                    alt="Avatar"
                    className="w-4 h-4 rounded-full border border-[#EAB308]"
                  />
                  <span className="hidden md:inline truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span className="hidden sm:inline">Student Portal</span>
                  <span className="sm:hidden">Login</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
