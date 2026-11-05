import React, { useState, useRef } from 'react';
import { UploadCloud, Music, FileAudio, Check, AlertCircle, Sparkles, X, Zap, Shield, Play } from 'lucide-react';
import { LectureSession, CaptionSegment } from '../types';
import { getAudioFileDuration, generateMomentsForAudio, generateStressTestLecture } from '../utils/audioProcessor';
import { saveStoredSessions, saveStoredSegments, getStoredSessions, getStoredSegments } from '../utils/storage';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (session: LectureSession) => void;
}

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/webm', 'audio/flac'];
    const isAudio = validTypes.includes(file.type) || /\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name);

    if (!isAudio) {
      setError('Please select a valid audio file (.mp3, .wav, .m4a, .aac, .ogg, .flac).');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Auto-fill title from clean filename
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setTitle(cleanName);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select or drop an audio file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Calculate duration from audio metadata
      const duration = await getAudioFileDuration(selectedFile);
      const audioUrl = URL.createObjectURL(selectedFile);

      // 2. Create session ID
      const sessionId = `uploaded-${Date.now()}`;

      // 3. Generate timestamped moments aligned to actual duration
      const segments: CaptionSegment[] = generateMomentsForAudio(sessionId, duration, subject);

      // 4. Create new LectureSession
      const newSession: LectureSession = {
        id: sessionId,
        title: title.trim() || selectedFile.name,
        subject: subject.trim() || 'General Subject',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        duration,
        audioUrl,
        createdAt: Date.now(),
        notes: `Imported audio track: ${selectedFile.name} (${Math.round(selectedFile.size / 1024 / 1024 * 10) / 10} MB). Generated ${segments.length} timestamped moments.`
      };

      // 5. Save to storage
      const existingSessions = getStoredSessions();
      saveStoredSessions([newSession, ...existingSessions]);

      const existingSegments = getStoredSegments();
      saveStoredSegments([...existingSegments, ...segments]);

      setIsProcessing(false);
      onUploadSuccess(newSession);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Failed to process audio file. Please check file format.');
      setIsProcessing(false);
    }
  };

  const handleLoadStressTest = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const { session, segments } = generateStressTestLecture(300); // 300 segments = 20 mins of high-traffic lecture
      const existingSessions = getStoredSessions();
      saveStoredSessions([session, ...existingSessions]);

      const existingSegments = getStoredSegments();
      saveStoredSegments([...existingSegments, ...segments]);

      setIsProcessing(false);
      onUploadSuccess(session);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-elevated-3d w-full max-w-xl p-6 sm:p-8 relative overflow-hidden mirror-surface border border-cyan-400/30 shadow-2xl"
        onDragEnter={handleDrag}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-glow text-xs font-mono font-bold mb-2">
            <Music className="w-3.5 h-3.5 text-cyan-glow" />
            <span>EXTERNAL AUDIO INGESTION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F1F5F9] tracking-tight">
            Import Lecture Audio File
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Upload MP3, WAV, M4A, or AAC audio recordings. Real-time timestamped moments and search indices will be automatically synchronized with zero latency.
          </p>
        </div>

        {/* Dropzone Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-cyan-400 bg-cyan-400/10 scale-[1.01]'
              : selectedFile
              ? 'border-[#05F292]/50 bg-[#05F292]/5'
              : 'border-white/20 hover:border-cyan-400/60 bg-white/[0.02] hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#05F292]/20 border border-[#05F292]/40 text-[#05F292] mx-auto flex items-center justify-center shadow-lg shadow-[#05F292]/20">
                <FileAudio className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-[#F1F5F9] truncate max-w-sm mx-auto">
                {selectedFile.name}
              </div>
              <div className="text-xs font-mono text-[#05F292]">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Ingestion
              </div>
              <div className="text-[11px] text-slate-400">
                Click or drop another file to replace
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-glow mx-auto flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#F1F5F9]">
                  Drag and drop lecture audio here, or <span className="text-cyan-glow underline">browse</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Supports MP3, WAV, M4A, AAC, FLAC, OGG, WEBM (Up to 250MB)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">
              Lecture Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Molecular Genetics & Transcription"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-[#F1F5F9] focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">
              Academic Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Biology 301"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-[#F1F5F9] focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={handleLoadStressTest}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Generate high-concurrency 300-segment lecture to stress-test search and scrubbing"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-glow" />
            <span>Simulate High-Traffic Corpus (300 Segs)</span>
          </button>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              type="button"
              className="btn-3d-obsidian px-4 py-2 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={handleImport}
              disabled={isProcessing || !selectedFile}
              className={`btn-3d-cyan inline-flex items-center space-x-2 px-5 py-2 text-xs font-extrabold shadow-3d-button ${
                (!selectedFile || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Ingesting Audio...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Process & Open Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
