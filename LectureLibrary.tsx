import React from 'react';
import { LectureSession } from '../types';
import { 
  Plus, Play, Clock, FileText, CheckCircle2, RotateCcw, 
  Sparkles, BookOpen, Trash2, HelpCircle, Network, 
  BarChart3, ArrowRight, Zap, Flame, UploadCloud, Music
} from 'lucide-react';
import { getStoredSegments } from '../utils/storage';
import { AppView } from './Sidebar';

interface LectureLibraryProps {
  sessions: LectureSession[];
  onSelectSession: (session: LectureSession, targetView?: AppView) => void;
  onNewLecture: () => void;
  onResetBenchmark: () => void;
  onDeleteSession: (id: string) => void;
  onOpenAudioUpload: () => void;
}

export const LectureLibrary: React.FC<LectureLibraryProps> = ({
  sessions,
  onSelectSession,
  onNewLecture,
  onResetBenchmark,
  onDeleteSession,
  onOpenAudioUpload
}) => {
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const allSegments = getStoredSegments();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 3D Glass Hero Banner with Mirror Reflection */}
      <div className="glass-elevated-3d p-6 sm:p-8 relative overflow-hidden mirror-surface">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-glow text-xs font-mono font-bold mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
            <span>BIOS SEED BUILD LAB • BT-14</span>
            <span>•</span>
            <span>Classroom Acoustic Recovery</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F1F5F9] tracking-tight leading-tight mb-3">
            “Find the part you missed, hear it again, and fix the words the AI misunderstood.”
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Real-time timestamped audio synchronization, instant keyword moment scrubbing, and transparent student corrections that fix speech model errors without altering raw teacher audio.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNewLecture}
              className="btn-3d-cyan inline-flex items-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-extrabold shadow-3d-button"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Live Lecture</span>
            </button>

            <button
              onClick={onOpenAudioUpload}
              className="btn-3d-obsidian inline-flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-cyan-400/40 hover:border-cyan-400"
            >
              <UploadCloud className="w-4 h-4 text-cyan-glow" />
              <span>Import Audio File</span>
            </button>

            <button
              onClick={onResetBenchmark}
              className="btn-3d-obsidian inline-flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4 text-cyan-glow" />
              <span>Reset 20-Term Benchmark</span>
            </button>
          </div>
        </div>

        {/* Specular Multi-Spectrum Radial Refractions */}
        <div className="absolute right-0 top-0 -mt-16 -mr-16 w-96 h-96 bg-cyan-glow/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 top-1/2 -mt-20 w-72 h-72 bg-[#F59E0B]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-80 h-80 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Library Content Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#F1F5F9] tracking-tight">Saved Sessions & Benchmarks</h2>
          <p className="text-xs sm:text-sm text-slate-400">Select any lecture to scrub audio, view Cornell notes, test concept quiz, or explore 3D knowledge map.</p>
        </div>
        <div className="text-xs font-mono text-cyan-glow bg-white/[0.05] px-3.5 py-1.5 rounded-xl border border-white/10 shadow-inner">
          {sessions.length} {sessions.length === 1 ? 'track' : 'tracks'} loaded
        </div>
      </div>

      {/* 3D Glass Cards Grid */}
      {sessions.length === 0 ? (
        <div className="glass-3d p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">No recorded lectures yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Start a live recording session or load the pre-configured Biology benchmark lecture to test keyword searching and corrections.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={onNewLecture}
              className="btn-3d-cyan px-4 py-2 text-xs font-extrabold shadow-3d-button"
            >
              Start Recording
            </button>
            <button
              onClick={onOpenAudioUpload}
              className="btn-3d-obsidian px-4 py-2 text-xs font-semibold text-cyan-glow border-cyan-400/30"
            >
              Import Audio
            </button>
            <button
              onClick={onResetBenchmark}
              className="btn-3d-obsidian px-4 py-2 text-xs font-semibold"
            >
              Load Benchmark
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const sessionSegs = allSegments.filter(s => s.sessionId === session.id);
            const editedCount = sessionSegs.filter(s => s.isEdited).length;
            const isBenchmark = session.id.includes('bio-photosynthesis');

            return (
              <div
                key={session.id}
                className="glass-3d flex flex-col justify-between overflow-hidden group hover:scale-[1.01]"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-cyan-400/15 text-cyan-glow border border-cyan-400/30">
                      {session.subject}
                    </span>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-cyan-glow" />
                      <span>{formatDuration(session.duration)}</span>
                    </div>
                  </div>

                  <h3 
                    onClick={() => onSelectSession(session, 'review')}
                    className="text-base font-extrabold text-[#F1F5F9] group-hover:text-cyan-glow transition-colors cursor-pointer line-clamp-2"
                  >
                    {session.title}
                  </h3>

                  {session.notes && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {session.notes}
                    </p>
                  )}

                  {isBenchmark && (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#05F292]/10 text-[#05F292] text-xs font-medium border border-[#05F292]/30">
                      <Sparkles className="w-3.5 h-3.5 text-[#05F292]" />
                      <span>20 Target Biological Terms Embedded</span>
                    </div>
                  )}

                  {/* Badges / Metrics */}
                  <div className="flex items-center space-x-3 text-xs text-slate-400 border-t border-white/10 pt-3">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-cyan-glow" />
                      <span>{sessionSegs.length} moments</span>
                    </div>

                    {editedCount > 0 ? (
                      <div className="flex items-center space-x-1 text-[#F59E0B] font-semibold bg-[#F59E0B]/15 px-2 py-0.5 rounded-md border border-[#F59E0B]/30 text-[11px]">
                        <span>{editedCount} AI fixes</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-[#05F292]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </div>
                    )}
                  </div>

                  {/* 3D Quick Feature Launchers */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5">
                    <button
                      onClick={() => onSelectSession(session, 'notes')}
                      className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-400/20 text-[11px] font-mono text-cyan-glow hover:text-white border border-white/10 transition-colors text-center font-bold"
                      title="Open Structured Notes"
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => onSelectSession(session, 'quiz')}
                      className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-[#8B5CF6]/20 text-[11px] font-mono text-[#A78BFA] hover:text-white border border-white/10 transition-colors text-center font-bold"
                      title="Open Concept Quiz"
                    >
                      Quiz
                    </button>
                    <button
                      onClick={() => onSelectSession(session, 'map')}
                      className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-[#05F292]/20 text-[11px] font-mono text-[#05F292] hover:text-white border border-white/10 transition-colors text-center font-bold"
                      title="Open 3D Knowledge Map"
                    >
                      Map
                    </button>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-black/30 px-5 py-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {session.date}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      title="Delete session"
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectSession(session, 'review')}
                      className="btn-3d-cyan inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold shadow-3d-button"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play & Search</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
