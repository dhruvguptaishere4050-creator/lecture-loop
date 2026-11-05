import React, { useState } from 'react';
import { LectureSession, CaptionSegment, StructuredNotesData } from '../types';
import { generateStructuredNotes } from '../utils/aiEngine';
import { 
  FileText, BookOpen, Clock, Download, CheckCircle, 
  Sparkles, Layers, ListChecks, HelpCircle, ArrowUpRight, 
  Copy, Check, Share2, Compass, Zap
} from 'lucide-react';

interface StructuredNotesViewProps {
  session: LectureSession;
  segments: CaptionSegment[];
  onJumpToMoment: (seconds: number) => void;
}

export const StructuredNotesView: React.FC<StructuredNotesViewProps> = ({
  session,
  segments,
  onJumpToMoment
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'definitions' | 'phases' | 'formulas'>('all');
  
  const notes: StructuredNotesData = generateStructuredNotes(session, segments);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyNotes = () => {
    const text = `# ${session.title} - AI Structured Notes
Subject: ${session.subject} | Date: ${session.date}

## Executive Summary
${notes.executiveSummary}

## Learning Objectives
${notes.learningObjectives.map(o => `- ${o}`).join('\n')}

## Key Definitions
${notes.keyDefinitions.map(d => `- **${d.term}** [${formatTime(d.timestamp)}]: ${d.definition}`).join('\n')}

## Chronological Breakdown
${notes.chronologicalSections.map(s => `### ${s.heading} [${formatTime(s.timestamp)}]\n${s.bulletPoints.map(b => `  * ${b}`).join('\n')}`).join('\n\n')}

## Critical Formulas / Equations
${notes.criticalFormulasOrReactions.map(f => `- \`${f}\``).join('\n')}

## Action Items for Exam Review
${notes.actionItems.map(a => `- [ ] ${a}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const text = `# ${session.title} - AI Structured Notes\n\n${notes.executiveSummary}\n\n## Key Terms\n` +
      notes.keyDefinitions.map(d => `- **${d.term}**: ${d.definition}`).join('\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.title.replace(/\s+/g, '_')}_StructuredNotes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 3D Glass Header Card with Mirror Surface */}
      <div className="glass-elevated-3d p-6 relative overflow-hidden mirror-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-glow text-xs font-mono font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cornell Synthesis System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
              {session.title} — Study Notes
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Synthesized directly from {segments.length} timestamped audio captions. Every key concept and equation is anchored to the exact classroom recording moment.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleCopyNotes}
              className="btn-3d-obsidian inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold"
            >
              {copied ? <Check className="w-4 h-4 text-[#05F292]" /> : <Copy className="w-4 h-4 text-cyan-glow" />}
              <span>{copied ? 'Copied' : 'Copy Notes'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="btn-3d-cyan inline-flex items-center space-x-2 px-4 py-2 text-xs font-extrabold shadow-3d-button"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Export .MD</span>
            </button>
          </div>
        </div>

        {/* Specular highlights */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-cyan-glow/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { key: 'all', label: 'Complete Outline' },
          { key: 'definitions', label: 'Key Definitions' },
          { key: 'phases', label: 'Chronological Phases' },
          { key: 'formulas', label: 'Formulas & Reactions' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'btn-3d-cyan shadow-3d-button text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Executive Summary & Detailed Sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* Executive Summary */}
          {(activeTab === 'all' || activeTab === 'phases') && (
            <div className="glass-3d p-6">
              <div className="flex items-center space-x-2 text-cyan-glow text-xs font-bold uppercase tracking-wider mb-3 font-mono">
                <FileText className="w-4 h-4" />
                <span>Executive Synthesis</span>
              </div>
              <p className="text-[#F1F5F9] text-sm leading-relaxed font-normal">
                {notes.executiveSummary}
              </p>

              {/* Learning Objectives */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#05F292] mb-3 font-mono">
                  <ListChecks className="w-4 h-4" />
                  <span>Target Learning Objectives</span>
                </div>
                <div className="space-y-2">
                  {notes.learningObjectives.map((obj, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-cyan-400/20 text-cyan-glow flex items-center justify-center font-bold text-[10px] mt-0.5 border border-cyan-400/30">
                        {i + 1}
                      </span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chronological Breakdown */}
          {(activeTab === 'all' || activeTab === 'phases') && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#F1F5F9] flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-glow" />
                <span>Chronological Lecture Progression</span>
              </h3>

              {notes.chronologicalSections.map((section, idx) => (
                <div
                  key={idx}
                  className="glass-3d p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#F1F5F9] flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-glow" />
                      <span>{section.heading}</span>
                    </h4>
                    <button
                      onClick={() => onJumpToMoment(section.timestamp)}
                      className="btn-3d-obsidian inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-cyan-glow hover:text-white"
                      title="Jump to this moment in audio replay"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(section.timestamp)}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed pl-1">
                    {section.bulletPoints.map((bp, bidx) => (
                      <li key={bidx} className="marker:text-cyan-glow">
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Formulas and Equations */}
          {(activeTab === 'all' || activeTab === 'formulas') && (
            <div className="glass-3d p-6">
              <div className="flex items-center space-x-2 text-[#A78BFA] text-xs font-bold uppercase tracking-wider mb-3 font-mono">
                <Sparkles className="w-4 h-4" />
                <span>Critical Formulas & Reactions</span>
              </div>
              <div className="space-y-3">
                {notes.criticalFormulasOrReactions.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-black/50 border border-white/10 rounded-xl font-mono text-xs text-cyan-glow overflow-x-auto leading-relaxed shadow-inner"
                  >
                    {formula}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Definitions & Action Items */}
        <div className="space-y-6">

          {/* Key Definitions */}
          {(activeTab === 'all' || activeTab === 'definitions') && (
            <div className="glass-3d p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-cyan-glow text-xs font-bold uppercase tracking-wider font-mono">
                  <BookOpen className="w-4 h-4" />
                  <span>Key Definitions</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {notes.keyDefinitions.length} terms
                </span>
              </div>

              <div className="space-y-3">
                {notes.keyDefinitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#F1F5F9]">{def.term}</span>
                      <button
                        onClick={() => onJumpToMoment(def.timestamp)}
                        className="text-[11px] font-mono text-cyan-glow hover:underline flex items-center space-x-0.5"
                      >
                        <span>{formatTime(def.timestamp)}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {def.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items Checklist */}
          <div className="glass-3d p-5">
            <div className="flex items-center space-x-2 text-[#05F292] text-xs font-bold uppercase tracking-wider mb-3 font-mono">
              <CheckCircle className="w-4 h-4" />
              <span>Exam Review Checklist</span>
            </div>
            <div className="space-y-2.5">
              {notes.actionItems.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start space-x-2.5 text-xs text-slate-300 hover:text-white cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-white/20 text-cyan-glow focus:ring-cyan-glow bg-black/40"
                  />
                  <span className="group-hover:text-white transition-colors leading-relaxed">
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
