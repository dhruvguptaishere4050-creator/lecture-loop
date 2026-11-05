import React, { useState, useMemo } from 'react';
import type { LectureSession, CaptionSegment, LectureAnalytics, AICorrection } from '../types';
import {
  Zap, TrendingUp, BookOpen, Brain, BarChart2, Tag,
  CheckCircle, XCircle, AlertTriangle, Lightbulb,
  ArrowRight, Clock, MessageSquare, ChevronDown, ChevronUp,
  Bookmark, Volume2, Target, Award, Sparkles, Check
} from 'lucide-react';
import { batchGenerateCorrections, computeLectureAnalytics, detectTopics, generateSmartSummary } from '../utils/aiEngine';

interface AIInsightPanelProps {
  session: LectureSession;
  segments: CaptionSegment[];
  onApplyCorrection: (segmentId: string, correctedText: string) => void;
  onJumpToSegment: (segmentId: string) => void;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  session,
  segments,
  onApplyCorrection,
  onJumpToSegment
}) => {
  const [activeSection, setActiveSection] = useState<'corrections' | 'analytics' | 'topics' | 'summary'>('corrections');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const corrections = useMemo(() => batchGenerateCorrections(segments), [segments]);
  const analytics = useMemo(() => computeLectureAnalytics(segments), [segments]);
  const topics = useMemo(() => detectTopics(segments), [segments]);
  const summary = useMemo(() => generateSmartSummary(segments), [segments]);

  const pendingCorrections = corrections.filter(c => !dismissedIds.has(c.segmentId) && !c.applied);

  const dismissCorrection = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const handleApply = (c: AICorrection) => {
    onApplyCorrection(c.segmentId, c.suggested);
    setDismissedIds(prev => new Set([...prev, c.segmentId]));
  };

  return (
    <div className="bg-[#10243D] rounded-2xl border border-[rgba(130,183,255,0.14)] shadow-ocean-card overflow-hidden">
      {/* Panel Header */}
      <div className="bg-[#071426] border-b border-[rgba(130,183,255,0.12)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#9B8CFF]/20 rounded-lg border border-[#9B8CFF]/30">
              <Brain className="w-4 h-4 text-[#9B8CFF]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#EAF2FF]">AI Insights Engine</h3>
              <p className="text-[10px] font-mono text-[#6D86A8]">100% Offline Diagnostic AI</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#193653] text-[#35C98A] border border-[#35C98A]/30">
            Score: {analytics.qualityScore}/100
          </span>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center space-x-1 mt-3 bg-[#10243D] p-1 rounded-xl border border-[rgba(130,183,255,0.08)]">
          {(['corrections', 'analytics', 'topics', 'summary'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                activeSection === tab
                  ? 'bg-[#3987FF] text-white shadow-electric-glow'
                  : 'text-[#A9BCD4] hover:text-[#EAF2FF]'
              }`}
            >
              {tab === 'corrections' && `Fixes (${pendingCorrections.length})`}
              {tab === 'analytics' && 'Analytics'}
              {tab === 'topics' && 'Topics'}
              {tab === 'summary' && 'Summary'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">

        {/* TAB 1: AI CORRECTION SUGGESTIONS */}
        {activeSection === 'corrections' && (
          <div className="space-y-3">
            {pendingCorrections.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-[#35C98A] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#EAF2FF]">No acoustic errors detected</p>
                <p className="text-[11px] text-[#A9BCD4] mt-1">All segments look clean or have been student-corrected.</p>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-[#A9BCD4] font-medium">
                  {pendingCorrections.length} acoustic confusion{pendingCorrections.length !== 1 ? 's' : ''} detected. Review before applying:
                </p>
                {pendingCorrections.map((c) => {
                  const seg = segments.find(s => s.id === c.segmentId);
                  return (
                    <div key={c.segmentId} className="bg-[#152C48] border border-[#FF5C6C]/30 rounded-xl p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-1.5 text-[#FF5C6C] font-bold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Misrecognition Flagged</span>
                        </div>
                        <button
                          onClick={() => seg && onJumpToSegment(seg.id)}
                          className="text-[11px] font-mono text-[#82B7FF] hover:underline whitespace-nowrap"
                        >
                          [{seg ? `${Math.floor(seg.startSeconds/60).toString().padStart(2,'0')}:${(seg.startSeconds%60).toFixed(0).padStart(2,'0')}` : ''}] →
                        </button>
                      </div>

                      {/* Before / After Diff */}
                      <div className="text-xs space-y-1.5">
                        <div className="p-2 bg-[#071426] border border-[#FF5C6C]/25 rounded-lg">
                          <span className="text-[9px] font-bold uppercase text-[#FF5C6C] block mb-0.5 font-mono">Recognized:</span>
                          <span className="text-[#A9BCD4] line-through">{c.original}</span>
                        </div>
                        <div className="p-2 bg-[#071426] border border-[#35C98A]/35 rounded-lg">
                          <span className="text-[9px] font-bold uppercase text-[#35C98A] block mb-0.5 font-mono">Suggested Term:</span>
                          <span className="text-[#EAF2FF] font-bold">{c.suggested}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#A9BCD4] italic leading-tight">
                        {c.reason}
                      </p>

                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleApply(c)}
                          className="flex items-center space-x-1 px-3 py-1 bg-[#35C98A] hover:bg-[#2db67b] text-slate-900 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Apply Fix</span>
                        </button>
                        <button
                          onClick={() => dismissCorrection(c.segmentId)}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-[#193653] hover:bg-[#1E3E63] text-[#A9BCD4] hover:text-[#EAF2FF] rounded-lg text-xs transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Dismiss</span>
                        </button>
                        <span className="ml-auto text-[10px] font-mono text-[#6D86A8]">
                          {Math.round(c.confidence * 100)}% conf
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* TAB 2: ANALYTICS DASHBOARD */}
        {activeSection === 'analytics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Segments', value: analytics.totalSegments.toString() },
                { label: 'Total Words', value: analytics.totalWords.toLocaleString() },
                { label: 'Student Fixes', value: `${analytics.editedCount} (${analytics.editedPct}%)` },
                { label: 'AI Confidence', value: `${analytics.avgConfidence}%` },
                { label: 'Flagged Noise', value: `${analytics.lowConfidenceCount} segs` },
                { label: 'Cadence', value: `${analytics.wordsPerMinute} WPM` },
              ].map((stat) => (
                <div key={stat.label} className="p-2.5 rounded-xl bg-[#152C48] border border-[rgba(130,183,255,0.1)]">
                  <div className="text-[#82B7FF] text-[9px] font-bold uppercase tracking-wider font-mono">
                    {stat.label}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#EAF2FF] font-mono mt-0.5">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Top Terms Cloud */}
            {analytics.topWords.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-[#82B7FF] uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <BarChart2 className="w-3.5 h-3.5 text-[#3987FF]" />
                  <span>Key Technical Terms</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analytics.topWords.map(({ word, count }) => (
                    <span
                      key={word}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-[#193653] text-[#82B7FF] border border-[rgba(130,183,255,0.14)]"
                    >
                      {word} <span className="text-[#3987FF]">×{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TOPICS */}
        {activeSection === 'topics' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[11px] font-bold text-[#82B7FF] uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Lightbulb className="w-3.5 h-3.5 text-[#9B8CFF]" />
                <span>Detected Subject Domain</span>
              </h4>
              {topics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-[#193653] text-[#EAF2FF] border border-[#3987FF]/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A9BCD4]">No dominant subject detected.</p>
              )}
            </div>

            <div className="bg-[#152C48] border border-[rgba(130,183,255,0.12)] rounded-xl p-3">
              <h4 className="text-xs font-bold text-[#EAF2FF] mb-1 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-[#3987FF]" />
                <span>Vocabulary Hints Loaded</span>
              </h4>
              <p className="text-[11px] text-[#A9BCD4] leading-relaxed">
                Subject vocabulary hints bias the speech engine toward recognizing technical terms like RuBisCO, photophosphorylation, and thylakoid.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: SMART SUMMARY */}
        {activeSection === 'summary' && (
          <div className="space-y-3">
            <div className="bg-[#152C48] border border-[rgba(130,183,255,0.14)] rounded-xl p-3.5">
              <div className="flex items-center space-x-1.5 mb-2.5">
                <BookOpen className="w-4 h-4 text-[#3987FF]" />
                <h4 className="text-xs font-bold text-[#EAF2FF]">3-Point Instant Summary</h4>
              </div>
              <div className="space-y-2 text-xs text-[#A9BCD4] leading-relaxed">
                {summary.split('\n\n').map((point, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-[#193653] text-[#82B7FF] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p>{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
