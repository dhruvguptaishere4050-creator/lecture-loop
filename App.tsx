import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LectureSession, CaptionSegment, UserProfile } from './types';
import { Sidebar, AppView } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LectureLibrary } from './components/LectureLibrary';
import { LiveLecture } from './components/LiveLecture';
import { LectureReview } from './components/LectureReview';
import { ClassroomLoginPage } from './components/ClassroomLoginPage';
import { AccuracyValidationModal } from './components/AccuracyValidationModal';
import { SummaryGlossaryModal } from './components/SummaryGlossaryModal';
import { ReferenceScriptModal } from './components/ReferenceScriptModal';
import { AudioUploadModal } from './components/AudioUploadModal';
import { getStoredSessions, saveStoredSessions, getStoredSegments, getCurrentUser } from './utils/storage';
import { Award, Zap, Loader2 } from 'lucide-react';

// Performance Optimization for High-Traffic / Large Datasets: Code-Split Heavy Views
const StructuredNotesView = lazy(() => import('./components/StructuredNotesView').then(m => ({ default: m.StructuredNotesView })));
const QuizGeneratorView = lazy(() => import('./components/QuizGeneratorView').then(m => ({ default: m.QuizGeneratorView })));
const KnowledgeMapView = lazy(() => import('./components/KnowledgeMapView').then(m => ({ default: m.KnowledgeMapView })));
const LearningAnalyticsView = lazy(() => import('./components/LearningAnalyticsView').then(m => ({ default: m.LearningAnalyticsView })));

// 3D Glass Loading Fallback Spinner
const ViewLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center p-16 space-y-4 glass-3d max-w-md mx-auto my-12">
    <div className="w-10 h-10 border-2 border-cyan-glow border-t-transparent rounded-full animate-spin" />
    <div className="text-xs font-mono font-bold text-cyan-glow uppercase tracking-wider">
      Synthesizing 3D Lecture Module...
    </div>
  </div>
);

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [sessions, setSessions] = useState<LectureSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<LectureSession | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [isAccuracyOpen, setIsAccuracyOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [isAudioUploadOpen, setIsAudioUploadOpen] = useState(false);

  // Load sessions from storage on mount
  useEffect(() => {
    const loaded = getStoredSessions();
    setSessions(loaded);
    if (loaded.length > 0 && !selectedSession) {
      setSelectedSession(loaded[0]);
    }
  }, []);

  const handleSelectSession = (session: LectureSession, targetView: AppView = 'review') => {
    setSelectedSession(session);
    setCurrentView(targetView);
  };

  const handleNewLecture = () => {
    setCurrentView('live');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    const loaded = getStoredSessions();
    setSessions(loaded);
    if (loaded.length > 0 && !selectedSession) {
      setSelectedSession(loaded[0]);
    }
    setCurrentView('library');
  };

  const handleRecordingComplete = (session: LectureSession) => {
    const updated = [session, ...sessions.filter((s) => s.id !== session.id)];
    setSessions(updated);
    setSelectedSession(session);
    setCurrentView('review');
  };

  const handleAudioUploadSuccess = (session: LectureSession) => {
    const updated = [session, ...sessions.filter((s) => s.id !== session.id)];
    setSessions(updated);
    setSelectedSession(session);
    setCurrentView('review');
  };

  const handleDeleteSession = (id: string) => {
    if (window.confirm('Delete this lecture recording and its captions?')) {
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      saveStoredSessions(updated);
      if (selectedSession?.id === id) {
        setSelectedSession(updated.length > 0 ? updated[0] : null);
        if (currentView !== 'library' && currentView !== 'live') {
          setCurrentView('library');
        }
      }
    }
  };

  const handleResetBenchmark = () => {
    localStorage.removeItem('lectureloop_sessions');
    localStorage.removeItem('lectureloop_segments');
    localStorage.removeItem('lectureloop_validation_records');
    const reset = getStoredSessions();
    setSessions(reset);
    setSelectedSession(reset[0]);
    alert('20-term Biology Photosynthesis benchmark reset successfully.');
  };

  // Jump to specific audio moment from Notes, Quiz, Map, or Summary
  const handleJumpToMoment = (seconds: number) => {
    if (selectedSession) {
      setCurrentView('review');
      // Dispatch seek event and play
      setTimeout(() => {
        const audio = document.querySelector('audio');
        if (audio) {
          audio.currentTime = Math.max(0, seconds - 2); // 2s context
          audio.play().catch(console.error);
        }
      }, 150);
    }
  };

  const activeSegments: CaptionSegment[] = selectedSession
    ? getStoredSegments(selectedSession.id)
    : [];

  return (
    <div className="min-h-screen bg-[#080C14] text-[#F1F5F9] flex flex-col font-sans selection:bg-cyan-glow/30 selection:text-white">
      
      {/* 3D Glass Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          if ((view === 'review' || view === 'notes' || view === 'quiz' || view === 'map' || view === 'analytics') && !selectedSession && sessions.length > 0) {
            setSelectedSession(sessions[0]);
          }
          setCurrentView(view);
        }}
        selectedSession={selectedSession}
        currentUser={currentUser}
        isRecording={currentView === 'live'}
        onOpenAccuracy={() => setIsAccuracyOpen(true)}
        onOpenScript={() => setIsScriptOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenAudioUpload={() => setIsAudioUploadOpen(true)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Offset for Desktop Sidebar) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        
        {/* Top Navbar */}
        <Navbar
          currentView={currentView}
          onNavigate={(view) => {
            if ((view === 'review' || view === 'notes' || view === 'quiz' || view === 'map' || view === 'analytics') && !selectedSession && sessions.length > 0) {
              setSelectedSession(sessions[0]);
            }
            setCurrentView(view);
          }}
          currentUser={currentUser}
          onOpenAccuracy={() => setIsAccuracyOpen(true)}
          onOpenSummary={() => setIsSummaryOpen(true)}
          onOpenScript={() => setIsScriptOpen(true)}
          onNewLecture={handleNewLecture}
          onResetBenchmark={handleResetBenchmark}
          onOpenAudioUpload={() => setIsAudioUploadOpen(true)}
          onOpenLogin={() => setCurrentView('login')}
          isRecording={currentView === 'live'}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
        />

        {/* View Router with Suspense Lazy-loading */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          
          {/* CLASSROOM AUTHENTICATION PORTAL */}
          {currentView === 'login' && (
            <ClassroomLoginPage
              onLoginSuccess={handleLoginSuccess}
              onContinueAsGuest={() => setCurrentView('library')}
            />
          )}

          {/* LIBRARY */}
          {currentView === 'library' && (
            <LectureLibrary
              sessions={sessions}
              onSelectSession={handleSelectSession}
              onNewLecture={handleNewLecture}
              onResetBenchmark={handleResetBenchmark}
              onDeleteSession={handleDeleteSession}
              onOpenAudioUpload={() => setIsAudioUploadOpen(true)}
            />
          )}

          {/* LIVE CAPTURE STUDIO */}
          {currentView === 'live' && (
            <LiveLecture
              onRecordingComplete={handleRecordingComplete}
              onCancel={() => setCurrentView('library')}
            />
          )}

          {/* PLAYER & TRANSCRIPT */}
          {currentView === 'review' && selectedSession && (
            <LectureReview
              session={selectedSession}
              onBack={() => setCurrentView('library')}
              onOpenAccuracy={() => setIsAccuracyOpen(true)}
              onOpenSummary={() => setIsSummaryOpen(true)}
            />
          )}

          {/* STRUCTURED NOTES (Lazy-loaded) */}
          {currentView === 'notes' && selectedSession && (
            <Suspense fallback={<ViewLoadingFallback />}>
              <StructuredNotesView
                session={selectedSession}
                segments={activeSegments}
                onJumpToMoment={handleJumpToMoment}
              />
            </Suspense>
          )}

          {/* AUTOMATIC QUIZ GENERATOR (Lazy-loaded) */}
          {currentView === 'quiz' && selectedSession && (
            <Suspense fallback={<ViewLoadingFallback />}>
              <QuizGeneratorView
                session={selectedSession}
                segments={activeSegments}
                onJumpToMoment={handleJumpToMoment}
              />
            </Suspense>
          )}

          {/* KNOWLEDGE MAP (Lazy-loaded) */}
          {currentView === 'map' && selectedSession && (
            <Suspense fallback={<ViewLoadingFallback />}>
              <KnowledgeMapView
                session={selectedSession}
                segments={activeSegments}
                onJumpToMoment={handleJumpToMoment}
              />
            </Suspense>
          )}

          {/* LEARNING ANALYTICS (Lazy-loaded) */}
          {currentView === 'analytics' && selectedSession && (
            <Suspense fallback={<ViewLoadingFallback />}>
              <LearningAnalyticsView
                session={selectedSession}
                segments={activeSegments}
              />
            </Suspense>
          )}

          {/* Empty state when no lecture selected for review/notes/quiz */}
          {(currentView !== 'library' && currentView !== 'live' && !selectedSession) && (
            <div className="max-w-md mx-auto mt-20 text-center p-8 glass-3d">
              <h3 className="text-base font-bold text-[#F1F5F9]">No Lecture Selected</h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">Please pick a lecture from the vault to scrub audio, view Cornell notes, test quiz, or inspect 3D knowledge map.</p>
              <button
                onClick={() => setCurrentView('library')}
                className="btn-3d-cyan px-5 py-2.5 text-xs font-extrabold shadow-3d-button"
              >
                Go to Lecture Vault
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Floating 3D Evidence Pill */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsAccuracyOpen(true)}
          className="flex items-center space-x-2.5 glass-elevated-3d hover:border-cyan-400/50 text-[#F1F5F9] px-4 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-105 group mirror-surface"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#05F292] animate-pulse" />
          <span>BT-14 Evidence Hub</span>
          <span className="text-[10px] font-mono font-bold bg-[#05F292]/15 text-[#05F292] px-1.5 py-0.5 rounded border border-[#05F292]/30">
            50pts
          </span>
        </button>
      </div>

      {/* Modals */}
      <AudioUploadModal
        isOpen={isAudioUploadOpen}
        onClose={() => setIsAudioUploadOpen(false)}
        onUploadSuccess={handleAudioUploadSuccess}
      />

      <AccuracyValidationModal
        isOpen={isAccuracyOpen}
        onClose={() => setIsAccuracyOpen(false)}
      />

      <SummaryGlossaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        onJumpToMoment={handleJumpToMoment}
      />

      <ReferenceScriptModal
        isOpen={isScriptOpen}
        onClose={() => setIsScriptOpen(false)}
      />
    </div>
  );
}

export default App;
