import React, { useState, useEffect, useRef } from 'react';
import { LectureSession, CaptionSegment } from '../types';
import { LectureSpeechRecorder, SpeechSegmentCallbackData } from '../utils/speechRecorder';
import { 
  Mic, MicOff, Square, Radio, CheckCircle, AlertTriangle, 
  ArrowDown, Sparkles, Volume2, ShieldCheck, ArrowRight,
  Clock, Play, RotateCcw, UploadCloud, FileAudio
} from 'lucide-react';
import { saveStoredSessions, saveStoredSegments, getStoredSessions, getStoredSegments } from '../utils/storage';
import { getAudioFileDuration, generateMomentsForAudio } from '../utils/audioProcessor';

interface LiveLectureProps {
  onRecordingComplete: (session: LectureSession) => void;
  onCancel: () => void;
}

export const LiveLecture: React.FC<LiveLectureProps> = ({
  onRecordingComplete,
  onCancel
}) => {
  const [title, setTitle] = useState('New Live Lecture');
  const [subject, setSubject] = useState('Biology');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [segments, setSegments] = useState<CaptionSegment[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [captureMode, setCaptureMode] = useState<'mic' | 'simulated' | 'upload'>('mic');
  const [statusMessage, setStatusMessage] = useState('Ready to capture');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Uploaded audio states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const recorderRef = useRef<LectureSpeechRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeSessionIdRef = useRef<string>(`session-${Date.now()}`);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (autoScroll && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments, interimText, autoScroll]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setTitle(cleanTitle);
  };

  const processUploadedAudio = async () => {
    if (!uploadedFile) return;
    setIsProcessingUpload(true);
    setStatusMessage('Analyzing audio metadata and synchronizing moments...');

    try {
      const duration = await getAudioFileDuration(uploadedFile);
      const audioUrl = URL.createObjectURL(uploadedFile);
      const sessionId = `uploaded-${Date.now()}`;
      const generated = generateMomentsForAudio(sessionId, duration, subject);

      const finalSession: LectureSession = {
        id: sessionId,
        title: title.trim() || uploadedFile.name,
        subject: subject.trim() || 'General Subject',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        duration,
        audioUrl,
        createdAt: Date.now(),
        notes: `Imported audio track: ${uploadedFile.name} (${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB) with ${generated.length} timestamped moments.`
      };

      const currentSessions = getStoredSessions();
      saveStoredSessions([finalSession, ...currentSessions]);

      const currentSegments = getStoredSegments();
      saveStoredSegments([...currentSegments, ...generated]);

      setIsProcessingUpload(false);
      onRecordingComplete(finalSession);
    } catch (err: any) {
      setErrorMessage('Failed to ingest uploaded audio file.');
      setIsProcessingUpload(false);
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setSegments([]);
    setInterimText('');
    setElapsedSeconds(0);
    activeSessionIdRef.current = `session-${Date.now()}`;

    const recorder = new LectureSpeechRecorder(
      // On Interim
      (text) => {
        setInterimText(text);
      },
      // On Final Segment
      (data: SpeechSegmentCallbackData) => {
        setSaveStatus('saving');
        const newSeg: CaptionSegment = {
          id: `seg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sessionId: activeSessionIdRef.current,
          sequenceNumber: segments.length + 1,
          startSeconds: data.startSeconds,
          endSeconds: data.endSeconds,
          originalText: data.text,
          isEdited: false,
          confidence: data.confidence || 0.9
        };

        setSegments((prev) => {
          const updated = [...prev, { ...newSeg, sequenceNumber: prev.length + 1 }];
          const allStored = getStoredSegments();
          saveStoredSegments([...allStored, newSeg]);
          return updated;
        });

        setTimeout(() => setSaveStatus('saved'), 400);
      },
      // On Error
      (err) => {
        setErrorMessage(err);
      }
    );

    recorderRef.current = recorder;

    let started = false;
    if (captureMode === 'mic') {
      setStatusMessage('Requesting microphone permission...');
      started = await recorder.startRealMicrophone();
      if (started) {
        setStatusMessage('Microphone active • Capturing live speech');
      } else {
        setStatusMessage('Simulation active (Microphone fallback)');
      }
    } else {
      recorder.startSimulation();
      setStatusMessage('Classroom Simulation active • Streaming speech');
      started = true;
    }

    setIsRecording(true);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;
    setStatusMessage('Finalizing transcription and encoding audio...');
    if (timerRef.current) clearInterval(timerRef.current);

    const result = await recorderRef.current.stop();
    setIsRecording(false);

    let audioUrl: string | undefined = undefined;
    if (result.audioBlob) {
      audioUrl = URL.createObjectURL(result.audioBlob);
    }

    const finalSession: LectureSession = {
      id: activeSessionIdRef.current,
      title: title.trim() || 'Recorded Lecture Session',
      subject: subject.trim() || 'General Subject',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      duration: Math.max(elapsedSeconds, result.durationSeconds || 1),
      audioUrl,
      createdAt: Date.now(),
      notes: `Captured live with ${segments.length} timestamped caption segments.`
    };

    const currentSessions = getStoredSessions();
    saveStoredSessions([finalSession, ...currentSessions]);

    setStatusMessage('Lecture successfully recorded and stored.');
    onRecordingComplete(finalSession);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Session Setup Card - 3D Glass Surface */}
      <div className="glass-elevated-3d p-6 sm:p-7 relative overflow-hidden mirror-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Capture Studio</span>
              {isRecording ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-mono font-bold animate-pulse border border-red-500/40">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>RECORDING LIVE</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-glow text-xs font-mono font-bold border border-cyan-400/30">
                  <span>Standby Ready</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                disabled={isRecording}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lecture Title (e.g. Molecular Biology - Photosynthesis)"
                className="text-base font-bold text-[#F1F5F9] bg-black/40 border border-white/15 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 w-full sm:w-2/3"
              />
              <input
                type="text"
                disabled={isRecording}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (e.g. Biology)"
                className="text-sm font-semibold text-cyan-glow bg-black/40 border border-white/15 rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 w-full sm:w-1/3"
              />
            </div>
          </div>

          {/* Timer and Mode Selector */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
            <div className="text-right">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Elapsed Time</div>
              <div className="text-3xl font-mono font-extrabold text-[#F1F5F9]">{formatTime(elapsedSeconds)}</div>
            </div>

            {!isRecording && (
              <div className="flex items-center space-x-1 bg-black/50 p-1 rounded-xl border border-white/10 text-xs font-medium">
                <button
                  onClick={() => setCaptureMode('mic')}
                  className={`px-3 py-1 rounded-lg transition-colors font-mono font-bold ${
                    captureMode === 'mic' 
                      ? 'bg-cyan-glow text-slate-900 shadow-3d-button' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Microphone
                </button>
                <button
                  onClick={() => setCaptureMode('simulated')}
                  className={`px-3 py-1 rounded-lg transition-colors font-mono font-bold ${
                    captureMode === 'simulated' 
                      ? 'bg-cyan-glow text-slate-900 shadow-3d-button' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Simulator
                </button>
                <button
                  onClick={() => setCaptureMode('upload')}
                  className={`px-3 py-1 rounded-lg transition-colors font-mono font-bold flex items-center space-x-1 ${
                    captureMode === 'upload' 
                      ? 'bg-cyan-glow text-slate-900 shadow-3d-button' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-0.5" />
                  <span>Upload Audio</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Audio File Upload Sub-Panel when captureMode === 'upload' */}
        {captureMode === 'upload' && !isRecording && (
          <div className="mb-5 p-5 rounded-2xl bg-black/30 border border-cyan-400/25 space-y-4 animate-fade-in">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-400/40 hover:border-cyan-400/80 rounded-xl p-6 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              {uploadedFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <FileAudio className="w-8 h-8 text-[#05F292]" />
                  <div className="text-left">
                    <div className="text-sm font-bold text-[#F1F5F9]">{uploadedFile.name}</div>
                    <div className="text-xs font-mono text-[#05F292]">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Ingestion</div>
                  </div>
                </div>
              ) : (
                <div>
                  <UploadCloud className="w-8 h-8 text-cyan-glow mx-auto mb-2" />
                  <div className="text-sm font-bold text-[#F1F5F9]">Select audio recording file (.mp3, .wav, .m4a, .aac)</div>
                  <div className="text-xs text-slate-400 mt-1">Click to browse your device files</div>
                </div>
              )}
            </div>

            {uploadedFile && (
              <div className="flex justify-end">
                <button
                  onClick={processUploadedAudio}
                  disabled={isProcessingUpload}
                  className="btn-3d-cyan inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-extrabold shadow-3d-button"
                >
                  {isProcessingUpload ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Audio...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Ingest Audio & Open Review</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Controls & Indicators */}
        {captureMode !== 'upload' && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="btn-3d-cyan inline-flex items-center space-x-2 px-6 py-3 text-xs sm:text-sm font-extrabold shadow-3d-button"
                >
                  <Mic className="w-4 h-4 stroke-[2.5]" />
                  <span>Start Live Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                >
                  <Square className="w-4 h-4 fill-current text-white" />
                  <span>Stop & Open Review</span>
                </button>
              )}

              {!isRecording && (
                <button
                  onClick={onCancel}
                  className="btn-3d-obsidian px-4 py-2.5 text-xs font-semibold"
                >
                  Cancel & Return
                </button>
              )}
            </div>

            {/* Live Waveform Indicator */}
            {isRecording && (
              <div className="flex items-center space-x-3 bg-white/[0.04] border border-cyan-400/40 px-4 py-2 rounded-xl">
                <div className="flex items-center space-x-1.5 h-6">
                  <span className="wave-bar-cyan" style={{ animationDelay: '0.1s' }} />
                  <span className="wave-bar-cyan" style={{ animationDelay: '0.3s' }} />
                  <span className="wave-bar-cyan" style={{ animationDelay: '0.2s' }} />
                  <span className="wave-bar-cyan" style={{ animationDelay: '0.4s' }} />
                  <span className="wave-bar-cyan" style={{ animationDelay: '0.15s' }} />
                </div>
                <span className="text-xs font-mono font-bold text-cyan-glow">
                  Streaming Audio & Syncing Timestamps
                </span>
              </div>
            )}

            {/* Incremental Save Status */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              {saveStatus === 'saving' && (
                <span className="text-[#FFB454] flex items-center space-x-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#FFB454] animate-ping" />
                  <span>Saving segment to disk...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-[#05F292] bg-[#05F292]/10 px-3 py-1 rounded-full border border-[#05F292]/30 flex items-center space-x-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#05F292]" />
                  <span>Incremental Save Confirmed</span>
                </span>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{errorMessage}</p>
              <p className="text-slate-300 mt-0.5">Switch mode to "Simulator" or "Upload Audio" to proceed without local mic hardware.</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Captions Display Box - 3D Glass */}
      <div className="glass-3d overflow-hidden flex flex-col h-[520px]">
        {/* Caption Panel Header */}
        <div className="bg-black/40 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-glow" />
            <h3 className="text-sm font-bold text-[#F1F5F9]">Live Captions Stream</h3>
            <span className="text-xs font-mono text-slate-400">({segments.length} saved segments)</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-xs px-3 py-1 rounded-xl font-medium border transition-colors flex items-center space-x-1.5 ${
                autoScroll
                  ? 'bg-white/[0.04] text-cyan-glow border-cyan-400/30'
                  : 'bg-[#FFB454]/15 text-[#FFB454] border-[#FFB454]/40 font-bold'
              }`}
            >
              <ArrowDown className={`w-3 h-3 ${autoScroll ? '' : 'text-[#FFB454]'}`} />
              <span>{autoScroll ? 'Auto-Scroll ON' : 'Auto-Scroll PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Caption Segments Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-black/20"
        >
          {segments.length === 0 && !interimText && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <Mic className="w-12 h-12 text-slate-600 mb-3 stroke-1" />
              <p className="text-sm font-bold text-[#F1F5F9]">Speech capture stream is idle</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Click "Start Live Recording" above or choose "Upload Audio". Spoken phrases will stream in real-time as interim text and finalize into persistent timestamped moments.
              </p>
            </div>
          )}

          {/* Finalized Segments */}
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="glass-3d p-4 hover:border-cyan-400/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-cyan-glow bg-cyan-400/15 px-2.5 py-0.5 rounded-lg border border-cyan-400/30">
                    [{formatTime(seg.startSeconds)} - {formatTime(seg.endSeconds)}]
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">#{seg.sequenceNumber}</span>
                </div>
                <span className="text-[11px] font-mono text-[#05F292] font-semibold bg-[#05F292]/10 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-[#05F292]/30">
                  <CheckCircle className="w-3 h-3" />
                  <span>Saved</span>
                </span>
              </div>

              <p className="text-[#F1F5F9] text-sm leading-relaxed font-normal">
                {seg.originalText}
              </p>
            </div>
          ))}

          {/* Interim Captions */}
          {interimText && (
            <div className="bg-[#8B5CF6]/10 rounded-xl border border-dashed border-[#8B5CF6]/50 p-4">
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-xs font-mono font-bold text-[#A78BFA] uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-ping" />
                  <span>Transcribing speech in progress...</span>
                </span>
              </div>
              <p className="text-[#F1F5F9] text-sm italic leading-relaxed">
                {interimText}
              </p>
            </div>
          )}

          <div ref={transcriptEndRef} />
        </div>

        {/* Caption Panel Footer */}
        <div className="bg-black/40 border-t border-white/10 px-5 py-3 text-xs text-slate-400 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#05F292]" />
            <span>{statusMessage}</span>
          </div>

          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs text-cyan-glow hover:underline font-bold"
            >
              Resume Auto-Scroll ↓
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
