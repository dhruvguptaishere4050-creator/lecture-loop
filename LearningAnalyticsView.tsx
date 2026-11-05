import React from 'react';
import { LectureSession, CaptionSegment } from '../types';
import { computeLectureAnalytics } from '../utils/aiEngine';
import { 
  BarChart3, Activity, Gauge, CheckCircle2, AlertTriangle, 
  Sparkles, Award, ShieldCheck, Zap, BookOpen, Clock 
} from 'lucide-react';

interface LearningAnalyticsViewProps {
  session: LectureSession;
  segments: CaptionSegment[];
}

export const LearningAnalyticsView: React.FC<LearningAnalyticsViewProps> = ({
  session,
  segments
}) => {
  const analytics = computeLectureAnalytics(segments);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 3D Glass Header Card */}
      <div className="glass-elevated-3d p-6 sm:p-7 relative overflow-hidden mirror-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#05F292]/15 border border-[#05F292]/30 text-[#05F292] text-xs font-mono font-bold mb-3 shadow-sm">
              <Activity className="w-3.5 h-3.5 text-[#05F292]" />
              <span>Diagnostic Telemetry & Speech Metrics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
              Learning & Speech Analytics
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Real-time capture diagnostics, speaker cadence analysis, acoustic confidence ratings, and student error correction provenance for <span className="text-cyan-glow font-bold">{session.title}</span>.
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-center min-w-[140px] shadow-inner">
            <div className="text-3xl font-extrabold text-[#05F292] font-mono">
              {analytics.qualityScore}
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <div className="text-[11px] text-cyan-glow uppercase font-bold tracking-wider mt-1 font-mono">
              Quality Index
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-[#05F292]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Speaking Cadence',
            value: `${analytics.wordsPerMinute} WPM`,
            desc: analytics.wordsPerMinute > 160 ? 'Fast Pace' : analytics.wordsPerMinute < 110 ? 'Deliberate Pace' : 'Optimal Pace',
            icon: <Gauge className="w-4 h-4 text-cyan-glow" />,
            color: 'text-cyan-glow'
          },
          {
            label: 'AI Model Confidence',
            value: `${analytics.avgConfidence}%`,
            desc: `${analytics.lowConfidenceCount} noisy moments flagged`,
            icon: <ShieldCheck className="w-4 h-4 text-sky-400" />,
            color: 'text-sky-400'
          },
          {
            label: 'Student Corrections',
            value: `${analytics.editedCount} (${analytics.editedPct}%)`,
            desc: 'Provenance fully preserved',
            icon: <CheckCircle2 className="w-4 h-4 text-[#05F292]" />,
            color: 'text-[#05F292]'
          },
          {
            label: 'Total Vocabulary',
            value: `${analytics.totalWords} words`,
            desc: `${analytics.totalSegments} caption segments`,
            icon: <BookOpen className="w-4 h-4 text-[#A78BFA]" />,
            color: 'text-[#A78BFA]'
          }
        ].map((card, idx) => (
          <div
            key={idx}
            className="glass-3d p-5 hover:border-cyan-400/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">{card.label}</span>
              <div className="p-1.5 rounded-lg bg-white/[0.05]">
                {card.icon}
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-extrabold ${card.color} font-mono`}>
              {card.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {card.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Deep Dive Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Top Technical Terms Frequency */}
        <div className="glass-3d p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-glow" />
              <span>Keyword Density Distribution</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Occurrences</span>
          </div>

          <div className="space-y-3">
            {analytics.topWords.length > 0 ? (
              analytics.topWords.map((item, idx) => {
                const maxCount = analytics.topWords[0]?.count || 1;
                const percentage = Math.round((item.count / maxCount) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#F1F5F9] font-semibold capitalize">{item.word}</span>
                      <span className="text-cyan-glow">{item.count}×</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-glow to-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No keywords extracted yet.</p>
            )}
          </div>
        </div>

        {/* Right: Acoustic Recognition Reliability & Provenance Audit */}
        <div className="glass-3d p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              <span>Acoustic Integrity Breakdown</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In noisy classrooms, non-native accents and complex multi-syllabic biological terminology degrade out-of-the-box speech model confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="text-xs text-slate-300 font-medium">High Confidence (&gt;85%)</div>
              <div className="text-lg font-bold text-[#05F292] font-mono mt-1">
                {segments.filter(s => (s.confidence ?? 0.9) >= 0.85).length} segments
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="text-xs text-slate-300 font-medium">Flagged for Review</div>
              <div className="text-lg font-bold text-[#FFB454] font-mono mt-1">
                {analytics.lowConfidenceCount} segments
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-[#F1F5F9] flex items-center space-x-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-glow" />
              <span>Correction Transparency Principle</span>
            </div>
            <p className="leading-relaxed">
              Student corrections do not alter the raw recorded teacher audio or delete original transcripts. Both are preserved side-by-side to maintain academic integrity and verifiable provenance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
