import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LectureSession, CaptionSegment } from '../types';
import {
  Play, Pause, Volume2, VolumeX, RotateCcw, Search, ArrowLeft,
  Edit3, Check, X, Sparkles, ChevronLeft, ChevronRight,
  HelpCircle, CheckCircle2, History, Download, FastForward,
  Keyboard, Zap, Brain, Bookmark, ArrowUpRight, Tag, Activity
} from 'lucide-react';
import { getStoredSegments, saveOrUpdateSegment, getOrCreateLectureAudioUrl } from '../utils/storage';
import { AIInsightPanel } from './AIInsightPanel';
import { BookmarkTagPanel } from './BookmarkTagPanel';
import { tagSegmentSentiment } from '../utils/aiEngine';
import { LiveActivityHUD } from './LiveActivityHUD';

interface LectureReviewProps {
  session: LectureSession;
  onBack: () => void;
  onOpenAccuracy: () => void;
  onOpenSummary: () => void;
}

export const LectureReview: React.FC<LectureReviewProps> = ({
  session,
  onBack,
  onOpenAccuracy,
  onOpenSummary
}) => {
  const [segments, setSegments] = useState<CaptionSegment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const [filterMatchesOnly, setFilterMatchesOnly] = useState(false);
  const [transparencyMode, setTransparencyMode] = useState<'current' | 'original' | 'diff'>('current');
  const [preRollSeconds] = useState(3);
  const [preRollEnabled, setPreRollEnabled] = useState(true);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(session.duration || 60);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Performance & Load optimization: Virtual batching
  const [visibleCount, setVisibleCount] = useState(50);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inline editing state
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Right-panel tab: Search / AI Insights / Bookmarks
  const [rightTab, setRightTab] = useState<'search' | 'ai' | 'bookmarks'>('search');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const audioUrl = useMemo(() => getOrCreateLectureAudioUrl(session), [session]);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2500);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setActiveMatchIndex(0);
    }, 120);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const loaded = getStoredSegments(session.id);
    setSegments(loaded.sort((a, b) => a.startSeconds - b.startSeconds));
  }, [session.id]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);

    if (progressBarRef.current) {
      const pct = Math.min(100, (time / (duration || 1)) * 100);
      progressBarRef.current.style.width = `${pct}%`;
    }

    const currentSeg = segments.find(s => time >= s.startSeconds && time <= s.endSeconds);
    if (currentSeg && !editingSegmentId && activeSegmentId !== currentSeg.id) {
      setActiveSegmentId(currentSeg.id);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(Math.max(audioRef.current.duration, session.duration));
    }
  };

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    const target = Math.max(0, Math.min(seconds, duration));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
    if (progressBarRef.current) {
      const pct = Math.min(100, (target / (duration || 1)) * 100);
      progressBarRef.current.style.width = `${pct}%`;
    }
  }, [duration]);

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      showToast(`Playback speed set to ${rate}x`);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const jumpToSegment = useCallback((seg: CaptionSegment, autoPlay = true) => {
    setActiveSegmentId(seg.id);
    const offset = preRollEnabled ? Math.max(0, seg.startSeconds - preRollSeconds) : seg.startSeconds;
    handleSeek(offset);

    const elem = segmentRefs.current[seg.id];
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (autoPlay && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
    showToast(`Jumped to [${Math.floor(offset / 60)}:${(offset % 60).toFixed(0).padStart(2, '0')}]${preRollEnabled ? ' (-3s pre-roll)' : ''}`);
  }, [handleSeek, preRollEnabled, preRollSeconds, showToast]);

  const matchingSegments = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase().trim();
    return segments.filter((seg) => {
      const curText = (seg.correctedText || seg.originalText).toLowerCase();
      const origText = seg.originalText.toLowerCase();
      return curText.includes(q) || origText.includes(q);
    });
  }, [segments, debouncedQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
          setEditingSegmentId(null);
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(currentTime - 5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(currentTime + 5);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, handleSeek, currentTime]);

  const handleNextMatch = () => {
    if (matchingSegments.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matchingSegments.length;
    setActiveMatchIndex(nextIdx);
    jumpToSegment(matchingSegments[nextIdx], isPlaying);
  };

  const handlePrevMatch = () => {
    if (matchingSegments.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + matchingSegments.length) % matchingSegments.length;
    setActiveMatchIndex(prevIdx);
    jumpToSegment(matchingSegments[prevIdx], isPlaying);
  };

  const handleStartEdit = (seg: CaptionSegment) => {
    setEditingSegmentId(seg.id);
    setEditText(seg.correctedText || seg.originalText);
  };

  const handleSaveEdit = (seg: CaptionSegment) => {
    if (!editText.trim()) return;
    const isDifferent = editText.trim() !== seg.originalText.trim();
    const updated: CaptionSegment = {
      ...seg,
      correctedText: isDifferent ? editText.trim() : undefined,
      isEdited: isDifferent
    };

    saveOrUpdateSegment(updated);
    setSegments((prev) => prev.map((s) => (s.id === seg.id ? updated : s)));
    setEditingSegmentId(null);
    showToast('Correction saved & search index updated');
  };

  const handleCancelEdit = () => {
    setEditingSegmentId(null);
    setEditText('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="moment-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const displayedSegments = filterMatchesOnly
    ? matchingSegments.slice(0, visibleCount)
    : segments.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Real-time Activity Telemetry HUD */}
      <LiveActivityHUD
        session={session}
        isPlaying={isPlaying}
        currentTime={currentTime}
        matchCount={matchingSegments.length}
      />

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-elevated-3d text-[#F1F5F9] px-5 py-2.5 rounded-2xl shadow-3d-elevated text-xs font-mono font-bold flex items-center space-x-2 border-t border-cyan-400/40 animate-bounce">
          <Zap className="w-4 h-4 text-cyan-glow" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* 3D Glass Interactive Audio Player Card */}
      <div className="glass-elevated-3d p-6 relative overflow-hidden mirror-surface">
        
        {/* Lecture Meta & Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-cyan-glow hover:text-white border border-white/10 transition-colors shadow-sm"
              title="Back to Vault"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-400/15 text-cyan-glow border border-cyan-400/30">
                  {session.subject}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {session.date}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-[#F1F5F9] tracking-tight mt-0.5">
                {session.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSummary}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#A78BFA] text-xs font-semibold border border-[#8B5CF6]/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>5-Min Summary</span>
            </button>
          </div>
        </div>

        {/* 3D Glass Scrubber & Player Controls */}
        <div className="space-y-3.5">
          
          {/* Progress Bar (Clickable 3D glass scrubber) */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              handleSeek(pct * duration);
            }}
            className="w-full h-3.5 bg-black/50 rounded-full overflow-hidden cursor-pointer relative group border border-white/10 shadow-inner"
          >
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-[#00D2FF] to-[#2563EB] rounded-full relative transition-[width] duration-75 shadow-cyan-glow"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-cyan-glow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Time & Playback Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            
            {/* Play/Pause & Skips */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => handleSeek(currentTime - 5)}
                className="btn-3d-obsidian px-2.5 py-1.5 text-xs font-mono text-cyan-glow"
                title="Seek backward 5s"
              >
                -5s
              </button>

              <button
                onClick={togglePlayPause}
                className="btn-3d-cyan w-12 h-12 flex items-center justify-center shadow-3d-button text-slate-950 font-bold"
                title="Play / Pause (Space)"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => handleSeek(currentTime + 5)}
                className="btn-3d-obsidian px-2.5 py-1.5 text-xs font-mono text-cyan-glow"
                title="Seek forward 5s"
              >
                +5s
              </button>

              {/* Time readout */}
              <div className="text-xs font-mono font-bold text-[#F1F5F9] pl-2">
                <span className="text-cyan-glow">{formatTime(currentTime)}</span>
                <span className="text-slate-500"> / </span>
                <span className="text-slate-300">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Speeds, Pre-roll Context Toggle, and Volume */}
            <div className="flex items-center space-x-3">
              
              {/* Playback speed selector */}
              <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px] font-mono font-bold">
                {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      playbackRate === rate
                        ? 'bg-cyan-glow text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Context Pre-Roll Toggle */}
              <label className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preRollEnabled}
                  onChange={(e) => setPreRollEnabled(e.target.checked)}
                  className="rounded border-white/20 text-cyan-glow focus:ring-cyan-glow bg-black/40"
                />
                <span className="font-mono text-[11px]">-3s Pre-Roll</span>
              </label>

              {/* Volume */}
              <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
                <button onClick={toggleMute} className="text-cyan-glow hover:text-white">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-cyan-glow"
                />
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Main Grid: Left Tabbed Controls + Right Transcript Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: 3D Tabbed Panel */}
        <div className="lg:col-span-1 space-y-4">

          <div className="glass-3d overflow-hidden">
            
            {/* Tab Switcher Header */}
            <div className="flex border-b border-white/10 bg-black/40">
              {([
                { key: 'search', label: 'Search', icon: <Search className="w-3.5 h-3.5" /> },
                { key: 'ai', label: 'AI Fixes', icon: <Brain className="w-3.5 h-3.5" /> },
                { key: 'bookmarks', label: 'Tags', icon: <Bookmark className="w-3.5 h-3.5" /> },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setRightTab(tab.key)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold transition-all ${
                    rightTab === tab.key
                      ? 'bg-white/[0.08] text-cyan-glow border-b-2 border-cyan-glow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: SEARCH & MOMENT NAVIGATION */}
            {rightTab === 'search' && (
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Moment Search</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-black/40 text-cyan-glow rounded border border-white/10">
                    Ctrl+K
                  </kbd>
                </div>

                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search word (e.g. 'RuBisCO')..."
                    className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-black/40 border border-white/10 rounded-xl text-[#F1F5F9] focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {searchQuery.trim() ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-cyan-glow bg-cyan-400/15 px-2.5 py-0.5 rounded-full border border-cyan-400/30 font-mono">
                        {matchingSegments.length} {matchingSegments.length === 1 ? 'match' : 'matches'}
                      </span>
                      {matchingSegments.length > 0 && (
                        <span className="text-slate-400 font-mono">{activeMatchIndex + 1} of {matchingSegments.length}</span>
                      )}
                    </div>

                    {matchingSegments.length > 0 ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handlePrevMatch}
                          className="btn-3d-obsidian flex-1 flex items-center justify-center space-x-1 py-1.5 text-xs font-bold text-slate-300"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Prev</span>
                        </button>
                        <button
                          onClick={handleNextMatch}
                          className="btn-3d-cyan flex-1 flex items-center justify-center space-x-1 py-1.5 text-xs font-bold shadow-3d-button"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No matches found.</p>
                    )}

                    <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer pt-1 border-t border-white/5">
                      <input
                        type="checkbox"
                        checked={filterMatchesOnly}
                        onChange={(e) => setFilterMatchesOnly(e.target.checked)}
                        className="rounded border-white/20 text-cyan-glow focus:ring-cyan-glow bg-black/40"
                      />
                      <span>Show only matching moments</span>
                    </label>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 space-y-2">
                    <p className="font-semibold text-cyan-glow font-mono">Quick benchmark terms:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['RuBisCO', 'chlorophyll', 'thylakoid', 'ATP-synthase'].map(term => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-400/20 hover:text-cyan-glow text-slate-300 font-mono text-[11px] font-medium transition-colors border border-white/10"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transparency Toggle */}
                <div className="pt-3 border-t border-white/5 space-y-1.5">
                  <span className="text-xs font-bold text-cyan-glow flex items-center space-x-1 uppercase tracking-wider font-mono">
                    <History className="w-3.5 h-3.5 text-cyan-glow" />
                    <span>Correction Provenance</span>
                  </span>
                  {(['current', 'original', 'diff'] as const).map((mode, i) => (
                    <button
                      key={mode}
                      onClick={() => setTransparencyMode(mode)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        transparencyMode === mode
                          ? mode === 'current' ? 'bg-cyan-400/20 text-cyan-glow font-bold border border-cyan-400/40'
                            : mode === 'original' ? 'bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/40'
                            : 'bg-[#05F292]/20 text-[#05F292] font-bold border border-[#05F292]/40'
                          : 'text-slate-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      {['1. Corrected (Student)', '2. Raw AI Recognizer', '3. Side-by-Side Diff'][i]}
                    </button>
                  ))}
                </div>

                {/* BT-14 Benchmark Link */}
                <button
                  onClick={onOpenAccuracy}
                  className="w-full py-2 bg-[#05F292]/10 hover:bg-[#05F292]/20 text-[#05F292] border border-[#05F292]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 mt-2 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>BT-14 Evidence Hub (50pts)</span>
                </button>
              </div>
            )}

            {/* TAB 2: AI INSIGHTS */}
            {rightTab === 'ai' && (
              <AIInsightPanel
                session={session}
                segments={segments}
                onApplyCorrection={(segmentId, correctedText) => {
                  const seg = segments.find(s => s.id === segmentId);
                  if (seg) {
                    const updated = { ...seg, correctedText, isEdited: true };
                    saveOrUpdateSegment(updated);
                    setSegments(prev => prev.map(s => s.id === segmentId ? updated : s));
                    showToast('AI correction applied & saved');
                  }
                }}
                onJumpToSegment={(segmentId) => {
                  const seg = segments.find(s => s.id === segmentId);
                  if (seg) jumpToSegment(seg, false);
                }}
              />
            )}

            {/* TAB 3: BOOKMARKS & TAGS */}
            {rightTab === 'bookmarks' && (
              <BookmarkTagPanel
                segments={segments}
                onSegmentsUpdated={setSegments}
                onJumpToSegment={(segmentId) => {
                  const seg = segments.find(s => s.id === segmentId);
                  if (seg) jumpToSegment(seg, false);
                }}
              />
            )}

          </div>

        </div>

        {/* Right Column: Searchable Moments & Transcript Cards */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>Showing {displayedSegments.length} of {segments.length} moments</span>
            <span className="text-cyan-glow">Click any timestamp to scrub audio</span>
          </div>

          {displayedSegments.length === 0 ? (
            <div className="glass-3d p-12 text-center">
              <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#F1F5F9]">No matching lecture moments</h4>
              <p className="text-xs text-slate-400 mt-1">Try another search term or clear the filter.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="btn-3d-cyan mt-4 px-4 py-2 text-xs font-bold shadow-3d-button"
              >
                Clear Search
              </button>
            </div>
          ) : (
            displayedSegments.map((seg) => {
              const isActive = activeSegmentId === seg.id;
              const isMatch = debouncedQuery && (
                (seg.correctedText || seg.originalText).toLowerCase().includes(debouncedQuery.toLowerCase().trim()) ||
                seg.originalText.toLowerCase().includes(debouncedQuery.toLowerCase().trim())
              );
              const isEditing = editingSegmentId === seg.id;
              const sentiment = tagSegmentSentiment(seg.correctedText || seg.originalText);

              return (
                <div
                  key={seg.id}
                  ref={(el) => { segmentRefs.current[seg.id] = el; }}
                  className={`glass-3d p-4.5 transition-all duration-150 ${
                    isActive
                      ? 'border-cyan-glow ring-2 ring-cyan-400/40 bg-white/[0.08] shadow-cyan-glow scale-[1.01]'
                      : isMatch
                      ? 'border-[#F59E0B]/60 bg-[#F59E0B]/5'
                      : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => jumpToSegment(seg, true)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                          isActive
                            ? 'btn-3d-cyan text-slate-950 shadow-3d-button'
                            : 'btn-3d-obsidian text-cyan-glow hover:text-white'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>[{formatTime(seg.startSeconds)} - {formatTime(seg.endSeconds)}]</span>
                      </button>

                      {seg.isEdited && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                          <span>[Edited by Student]</span>
                        </span>
                      )}

                      {sentiment === 'emphasis' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/15 text-cyan-glow border border-cyan-400/30">
                          <span>Key Point</span>
                        </span>
                      )}

                      {sentiment === 'question' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
                          <span>Question</span>
                        </span>
                      )}

                      {seg.confidence && seg.confidence < 0.75 && !seg.isEdited && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                          <span>AI Conf: {Math.round(seg.confidence * 100)}%</span>
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(seg)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:text-cyan-glow hover:bg-white/[0.05] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Fix AI Error</span>
                      </button>
                    )}
                  </div>

                  {/* Segment Body */}
                  {isEditing ? (
                    <div className="space-y-3 pt-1">
                      <textarea
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full text-sm font-normal text-[#F1F5F9] bg-black/60 border border-cyan-glow rounded-xl p-3 focus:outline-none shadow-inner"
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveEdit(seg)}
                          className="btn-3d-cyan flex items-center space-x-1.5 px-4 py-2 text-xs font-bold shadow-3d-button"
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Save Correction</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-3d-obsidian flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-300"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {transparencyMode === 'current' && (
                        <p className="text-[#F1F5F9] text-sm sm:text-base leading-relaxed">
                          {renderHighlightedText(seg.correctedText || seg.originalText, debouncedQuery)}
                        </p>
                      )}

                      {transparencyMode === 'original' && (
                        <div>
                          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            {renderHighlightedText(seg.originalText, debouncedQuery)}
                          </p>
                          {seg.isEdited && (
                            <span className="text-[11px] font-mono text-[#F59E0B] italic block mt-1">
                              (Original unedited recognizer transcript)
                            </span>
                          )}
                        </div>
                      )}

                      {transparencyMode === 'diff' && (
                        <div className="space-y-2 text-xs sm:text-sm">
                          {seg.isEdited ? (
                            <div className="space-y-2 bg-black/40 p-3.5 rounded-xl border border-white/10">
                              <div className="text-[11px] font-mono font-bold text-red-400">Original (AI Recognizer):</div>
                              <p className="text-slate-400 line-through">
                                {seg.originalText}
                              </p>
                              <div className="text-[11px] font-mono font-bold text-[#05F292] pt-1">Corrected (Student Fix):</div>
                              <p className="text-[#F1F5F9] font-bold">
                                {seg.correctedText}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[#F1F5F9] text-sm sm:text-base leading-relaxed">
                              {seg.originalText}
                              <span className="text-xs text-slate-500 block mt-1 font-mono">(No human corrections made to this segment)</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}

          {/* Load More Batching */}
          {visibleCount < (filterMatchesOnly ? matchingSegments.length : segments.length) && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setVisibleCount((c) => c + 50)}
                className="btn-3d-obsidian px-5 py-2.5 text-xs font-bold text-cyan-glow"
              >
                Load More Moments ({segments.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
