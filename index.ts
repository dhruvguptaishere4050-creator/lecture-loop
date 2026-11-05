export interface CaptionSegment {
  id: string;
  sessionId: string;
  sequenceNumber: number;
  startSeconds: number;
  endSeconds: number;
  originalText: string;
  correctedText?: string;
  isEdited: boolean;
  confidence?: number;
  speaker?: string;
  // AI-enhanced fields
  aiSuggestion?: string;        // AI correction suggestion (not auto-applied)
  aiSuggestionAccepted?: boolean;
  sentiment?: 'neutral' | 'emphasis' | 'question';
  bookmarked?: boolean;
  tags?: string[];              // student-applied topic tags
  noiseFlag?: boolean;          // flagged as likely noise-corrupted
}

export interface LectureSession {
  id: string;
  title: string;
  subject: string;
  date: string;
  status: 'recording' | 'completed' | 'draft';
  duration: number; // in seconds
  audioUrl?: string;
  createdAt: number;
  notes?: string;
  // Analytics
  wordCount?: number;
  editedSegmentCount?: number;
  avgConfidence?: number;
  language?: string;
  // AI-enhanced
  aiSummary?: string;
  aiTopics?: string[];
  vocabularyHints?: string[];  // subject-specific hint words fed to speech engine
}

export interface ValidationRecord {
  id: string;
  testerRole: string;
  task: string;
  completedWithoutHelp: boolean;
  timeTaken: string;
  feedback: string;
  changeMade: string;
  retestResult: string;
}

export interface VocabularyAccuracyItem {
  id: string;
  term: string;
  expectedCount: number;
  rawRecognizedCount: number;
  commonMisrecognitions: string[];
  status: 'perfect' | 'misrecognized' | 'missed';
}

export interface KeyConcept {
  id: string;
  term: string;
  definition: string;
  timestampSeconds: number;
}

export interface BookmarkedMoment {
  id: string;
  segmentId: string;
  sessionId: string;
  label: string;
  createdAt: number;
}

export interface LectureAnalytics {
  totalSegments: number;
  totalWords: number;
  editedCount: number;
  editedPct: number;
  avgConfidence: number;
  lowConfidenceCount: number;
  bookmarkCount: number;
  topWords: { word: string; count: number }[];
  wordsPerMinute: number;
  qualityScore: number; // 0-100 combined metric
}

export interface AICorrection {
  segmentId: string;
  original: string;
  suggested: string;
  reason: string;
  confidence: number;
  applied: boolean;
}

// ─── NEW FEATURES ────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedTimestamp: number;
  keyConcept: string;
}

export interface LectureQuiz {
  sessionId: string;
  questions: QuizQuestion[];
  generatedAt: number;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  category: 'core' | 'process' | 'molecule' | 'structure' | 'outcome';
  timestampSeconds: number;
  summary: string;
  importance: number; // 1-5
}

export interface KnowledgeEdge {
  from: string;
  to: string;
  label: string;
}

export interface KnowledgeMapData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface StructuredNotesData {
  executiveSummary: string;
  learningObjectives: string[];
  keyDefinitions: { term: string; definition: string; timestamp: number }[];
  chronologicalSections: {
    heading: string;
    timestamp: number;
    bulletPoints: string[];
  }[];
  criticalFormulasOrReactions: string[];
  actionItems: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  isVerified: boolean;
  institution?: string;
  enrolledCourses?: string[];
  createdAt: number;
  lastLogin: number;
}

