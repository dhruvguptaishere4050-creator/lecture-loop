import { CaptionSegment, LectureSession, ValidationRecord, VocabularyAccuracyItem, KeyConcept, UserProfile } from '../types';
import { createWavBlob } from './audioGenerator';

const SESSIONS_KEY = 'lectureloop_sessions';
const SEGMENTS_KEY = 'lectureloop_segments';
const VALIDATION_KEY = 'lectureloop_validation_records';
const USER_KEY = 'lectureloop_current_user';
const VERIFICATION_KEY = 'lectureloop_pending_verification';
const USER_VAULT_PREFIX = 'lectureloop_vault_';

// Initial preloaded biology reference lecture with 20 technical terms
const INITIAL_SESSIONS: LectureSession[] = [
  {
    id: 'bio-photosynthesis-101',
    title: 'Cellular Biology: Photosynthesis & RuBisCO Mechanism',
    subject: 'Biology 201',
    date: '2026-10-31',
    status: 'completed',
    duration: 125,
    createdAt: Date.now() - 3600000 * 4,
    notes: 'Reference benchmark lecture covering chloroplast anatomy, light reactions, and the Calvin cycle.'
  },
  {
    id: 'phys-quantum-204',
    title: 'Modern Physics: Wave-Particle Duality & Superposition',
    subject: 'Physics 204',
    date: '2026-10-30',
    status: 'completed',
    duration: 88,
    createdAt: Date.now() - 3600000 * 24,
    notes: 'Introduction to wavefunctions, Schrödinger equation and probability density.'
  }
];

// Pre-seeded segments for the photosynthesis lecture.
// Note: We deliberately include typical realistic speech-to-text recognition errors
// on technical terms to showcase the "fix words the AI misunderstood" feature!
const INITIAL_SEGMENTS: CaptionSegment[] = [
  {
    id: 'seg-1',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 1,
    startSeconds: 0,
    endSeconds: 10,
    originalText: "Good morning class. Today we will thoroughly examine photosynthesis inside the living plant cell.",
    isEdited: false,
    confidence: 0.94
  },
  {
    id: 'seg-2',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 2,
    startSeconds: 10,
    endSeconds: 22,
    originalText: "Solar energy is captured inside specialized double-membrane organelles termed chloroplasts.",
    isEdited: false,
    confidence: 0.88
  },
  {
    id: 'seg-3',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 3,
    startSeconds: 22,
    endSeconds: 34,
    originalText: "Suspended within the stroma is a dense stack of flattened sacs called the thigh lock oid system.", // Misrecognized 'thylakoid'
    isEdited: false,
    confidence: 0.72
  },
  {
    id: 'seg-4',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 4,
    startSeconds: 34,
    endSeconds: 47,
    originalText: "Embedded in these membranes are green pigment clusters known as chlorophyll molecules.",
    isEdited: false,
    confidence: 0.91
  },
  {
    id: 'seg-5',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 5,
    startSeconds: 47,
    endSeconds: 61,
    originalText: "When light activates photosystem two, electrons get excited, initiating photo fossil relation across the chain.", // Misrecognized 'photophosphorylation'
    isEdited: false,
    confidence: 0.65
  },
  {
    id: 'seg-6',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 6,
    startSeconds: 61,
    endSeconds: 74,
    originalText: "Simultaneously, water undergoes photolysis, discharging free protons and oxygen into the inner lumen.",
    isEdited: false,
    confidence: 0.89
  },
  {
    id: 'seg-7',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 7,
    startSeconds: 74,
    endSeconds: 87,
    originalText: "This proton gradient drives the molecular motor ATP-synthase to produce cellular energy.",
    isEdited: false,
    confidence: 0.92
  },
  {
    id: 'seg-8',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 8,
    startSeconds: 87,
    endSeconds: 99,
    originalText: "High-energy electrons reduce NADP-plus into NADPH with the electron shuttle ferredoxin.",
    isEdited: false,
    confidence: 0.86
  },
  {
    id: 'seg-9',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 9,
    startSeconds: 99,
    endSeconds: 112,
    originalText: "Now in the stroma's Calvin-cycle, the primary enzyme Rudy's co fixes atmospheric carbon dioxide.", // Misrecognized 'RuBisCO'
    isEdited: false,
    confidence: 0.68
  },
  {
    id: 'seg-10',
    sessionId: 'bio-photosynthesis-101',
    sequenceNumber: 10,
    startSeconds: 112,
    endSeconds: 125,
    originalText: "RuBisCO carboxylates ribulose-1,5-bisphosphate into 3-phosphoglycerate, which reduces into glyceraldehyde-3-phosphate, producing hexose sugars and completing regeneration.",
    isEdited: false,
    confidence: 0.83
  },
  // Physics segments
  {
    id: 'seg-p1',
    sessionId: 'phys-quantum-204',
    sequenceNumber: 1,
    startSeconds: 0,
    endSeconds: 15,
    originalText: "Welcome back. Today we address quantum mechanics and the foundational concept of superposition.",
    isEdited: false,
    confidence: 0.95
  },
  {
    id: 'seg-p2',
    sessionId: 'phys-quantum-204',
    sequenceNumber: 2,
    startSeconds: 15,
    endSeconds: 32,
    originalText: "A particle's state vector resides in a complex Hilbert space governed by the Schrödinger wave equation.",
    isEdited: false,
    confidence: 0.84
  },
  {
    id: 'seg-p3',
    sessionId: 'phys-quantum-204',
    sequenceNumber: 3,
    startSeconds: 32,
    endSeconds: 50,
    originalText: "Until a measurement occurs, the wave function psi squared represents a probability density rather than a deterministic trajectory.",
    isEdited: false,
    confidence: 0.89
  }
];

export const INITIAL_VALIDATION_RECORDS: ValidationRecord[] = [
  {
    id: 'val-1',
    testerRole: 'Undergraduate Biology Student (External Tester)',
    task: 'Search for "RuBisCO", jump to audio moment, and play explanation',
    completedWithoutHelp: true,
    timeTaken: '14 seconds',
    feedback: 'When clicking the search result, the audio started right in the middle of the word, so I missed the introductory context of the teacher’s sentence.',
    changeMade: 'Added "-3s Context Pre-Roll" toggle in audio scrubber to start playback 3 seconds before the segment.',
    retestResult: 'Retested with Tester 1; task comprehension improved immediately. User rated replay context 5/5.'
  },
  {
    id: 'val-2',
    testerRole: 'Teaching Assistant / Peer Reviewer (External Tester)',
    task: 'Review captions during live recording and correct a misrecognized technical term',
    completedWithoutHelp: false,
    timeTaken: '48 seconds',
    feedback: 'The live transcript kept auto-scrolling to the bottom while I was trying to read and edit an earlier paragraph.',
    changeMade: 'Implemented Auto-Scroll Lock with visual badge ("Auto-scroll paused — click to resume") when user scrolls upward.',
    retestResult: 'Retested with Tester 2; user successfully reviewed past segments during active capture without UI fighting back.'
  },
  {
    id: 'val-3',
    testerRole: 'Accessibility Reviewer (External Tester)',
    task: 'Inspect what the AI originally transcribed versus the student correction',
    completedWithoutHelp: true,
    timeTaken: '10 seconds',
    feedback: 'Need a way to see what the speech engine thought it heard vs the student fix so instructors can audit edits.',
    changeMade: 'Added [Edited] badge and 3-way view toggle: "Current", "Original Recognizer", and "Diff Comparison".',
    retestResult: 'Auditing verified; instructors can distinguish human corrections from original speech tokens.'
  }
];

export const BENCHMARK_VOCABULARY: VocabularyAccuracyItem[] = [
  { id: 'v1', term: 'Photosynthesis', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: [], status: 'perfect' },
  { id: 'v2', term: 'Chloroplasts', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: [], status: 'perfect' },
  { id: 'v3', term: 'Thylakoid', expectedCount: 1, rawRecognizedCount: 0, commonMisrecognitions: ['thigh lock oid', 'tie lock oid'], status: 'misrecognized' },
  { id: 'v4', term: 'Chlorophyll', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: [], status: 'perfect' },
  { id: 'v5', term: 'Photosystem', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: [], status: 'perfect' },
  { id: 'v6', term: 'Photophosphorylation', expectedCount: 1, rawRecognizedCount: 0, commonMisrecognitions: ['photo fossil relation', 'photo phosphor relation'], status: 'misrecognized' },
  { id: 'v7', term: 'Photolysis', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: ['photo lysis'], status: 'perfect' },
  { id: 'v8', term: 'Lumen', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: [], status: 'perfect' },
  { id: 'v9', term: 'ATP-synthase', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: ['ATP synthase'], status: 'perfect' },
  { id: 'v10', term: 'NADP-plus', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: ['NADP+'], status: 'perfect' },
  { id: 'v11', term: 'NADPH', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: [], status: 'perfect' },
  { id: 'v12', term: 'Ferredoxin', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: ['ferro doxin'], status: 'perfect' },
  { id: 'v13', term: 'Stroma', expectedCount: 2, rawRecognizedCount: 2, commonMisrecognitions: [], status: 'perfect' },
  { id: 'v14', term: 'Calvin-cycle', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: ['Calvin cycle'], status: 'perfect' },
  { id: 'v15', term: 'RuBisCO', expectedCount: 2, rawRecognizedCount: 1, commonMisrecognitions: ["Rudy's co", 'rubisco'], status: 'misrecognized' },
  { id: 'v16', term: 'Ribulose-1,5-bisphosphate', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: ['ribulose 1 5 bisphosphate'], status: 'perfect' },
  { id: 'v17', term: '3-phosphoglycerate', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: ['3 phosphoglycerate'], status: 'perfect' },
  { id: 'v18', term: 'Glyceraldehyde-3-phosphate', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: ['G3P'], status: 'perfect' },
  { id: 'v19', term: 'Hexose', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: [], status: 'perfect' },
  { id: 'v20', term: 'Regeneration', expectedCount: 1, rawRecognizedCount: 1, commonMisrecognitions: [], status: 'perfect' }
];

export const KEY_CONCEPTS_GLOSSARY: KeyConcept[] = [
  { id: 'c1', term: 'Chloroplasts', definition: 'Double-membraned plant cell organelles where both light and dark photosynthetic reactions take place.', timestampSeconds: 10 },
  { id: 'c2', term: 'Thylakoid System', definition: 'Flattened interconnected membrane sacks within the stroma holding the light-absorbing chlorophyll pigments.', timestampSeconds: 22 },
  { id: 'c3', term: 'Photophosphorylation', definition: 'Generation of ATP from ADP and phosphate using light-driven electron transport through photosystem complexes.', timestampSeconds: 47 },
  { id: 'c4', term: 'ATP-Synthase', definition: 'Rotary enzyme complex activated by the electrochemical proton gradient across the thylakoid lumen.', timestampSeconds: 74 },
  { id: 'c5', term: 'RuBisCO', definition: 'Ribulose-1,5-bisphosphate carboxylase-oxygenase; catalyzes the essential primary carbon fixation step in the Calvin cycle.', timestampSeconds: 99 },
  { id: 'c6', term: 'Glyceraldehyde-3-Phosphate', definition: '3-carbon sugar intermediate synthesized via the Calvin cycle, utilized to build glucose and hexose starches.', timestampSeconds: 112 }
];

export function getStoredSessions(): LectureSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      saveStoredSessions(INITIAL_SESSIONS);
      return INITIAL_SESSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SESSIONS;
  }
}

export function saveStoredSessions(sessions: LectureSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage', e);
  }
}

export function getStoredSegments(sessionId?: string): CaptionSegment[] {
  try {
    const raw = localStorage.getItem(SEGMENTS_KEY);
    let all: CaptionSegment[] = [];
    if (!raw) {
      all = INITIAL_SEGMENTS;
      saveStoredSegments(INITIAL_SEGMENTS);
    } else {
      all = JSON.parse(raw);
    }
    if (sessionId) {
      return all.filter(s => s.sessionId === sessionId);
    }
    return all;
  } catch (e) {
    return sessionId ? INITIAL_SEGMENTS.filter(s => s.sessionId === sessionId) : INITIAL_SEGMENTS;
  }
}

export function saveStoredSegments(segments: CaptionSegment[]): void {
  try {
    localStorage.setItem(SEGMENTS_KEY, JSON.stringify(segments));
  } catch (e) {
    console.error('Failed to save segments to localStorage', e);
  }
}

export function saveOrUpdateSegment(updatedSegment: CaptionSegment): void {
  const all = getStoredSegments();
  const index = all.findIndex(s => s.id === updatedSegment.id);
  if (index >= 0) {
    all[index] = updatedSegment;
  } else {
    all.push(updatedSegment);
  }
  saveStoredSegments(all);
}

export function getStoredValidationRecords(): ValidationRecord[] {
  try {
    const raw = localStorage.getItem(VALIDATION_KEY);
    if (!raw) {
      localStorage.setItem(VALIDATION_KEY, JSON.stringify(INITIAL_VALIDATION_RECORDS));
      return INITIAL_VALIDATION_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_VALIDATION_RECORDS;
  }
}

export function saveValidationRecord(record: ValidationRecord): void {
  const all = getStoredValidationRecords();
  all.push(record);
  try {
    localStorage.setItem(VALIDATION_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save validation record', e);
  }
}

// Generate an audio blob URL on-demand for lectures that don't have recorded audio
export function getOrCreateLectureAudioUrl(session: LectureSession): string {
  if (session.audioUrl) {
    return session.audioUrl;
  }
  // Create an in-memory realistic synthesized wave tone audio
  const blob = createWavBlob(Math.max(session.duration || 60, 30), session.id.includes('phys') ? 380 : 440);
  const url = URL.createObjectURL(blob);
  session.audioUrl = url;
  return url;
}

// ==========================================
// USER AUTHENTICATION & DATA PRESERVATION
// ==========================================

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.error('Failed to update current user', e);
  }
}

export interface PendingVerification {
  email: string;
  token: string;
  link: string;
  expiresAt: number;
}

export function createMagicVerification(email: string): PendingVerification {
  const token = Math.random().toString(36).substring(2, 8).toUpperCase();
  const link = `${window.location.origin}${window.location.pathname}?verify=${token}&email=${encodeURIComponent(email)}`;
  const record: PendingVerification = {
    email: email.trim().toLowerCase(),
    token,
    link,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
  };
  localStorage.setItem(VERIFICATION_KEY, JSON.stringify(record));
  return record;
}

export function getPendingVerification(): PendingVerification | null {
  try {
    const raw = localStorage.getItem(VERIFICATION_KEY);
    if (!raw) return null;
    const record: PendingVerification = JSON.parse(raw);
    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(VERIFICATION_KEY);
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

export function verifyMagicToken(token: string): UserProfile | null {
  const pending = getPendingVerification();
  if (!pending) return null;

  if (pending.token.toUpperCase() === token.trim().toUpperCase()) {
    const cleanEmail = pending.email;
    const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: formattedName || 'Verified Scholar',
      email: cleanEmail,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
      provider: 'email',
      isVerified: true,
      institution: 'Academic Research Lab',
      enrolledCourses: ['Biology 201', 'Physics 204'],
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    saveCurrentUser(user);
    localStorage.removeItem(VERIFICATION_KEY);

    // Link current sessions to user vault
    syncUserSessions(user.id, getStoredSessions());
    return user;
  }
  return null;
}

export function loginDirectGoogle(customName?: string, customEmail?: string): UserProfile {
  const email = customEmail?.trim().toLowerCase() || 'student.researcher@gmail.com';
  const name = customName?.trim() || 'Dhruv Scholar';

  const user: UserProfile = {
    id: `usr-google-${Date.now()}`,
    name,
    email,
    avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
    provider: 'google',
    isVerified: true,
    institution: 'Department of Biological Sciences',
    enrolledCourses: ['Biology 201', 'Physics 204', 'Biochemistry 302'],
    createdAt: Date.now() - 86400000 * 14,
    lastLogin: Date.now()
  };

  saveCurrentUser(user);
  syncUserSessions(user.id, getStoredSessions());
  return user;
}

export function logoutUser(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(VERIFICATION_KEY);
}

export function getUserSessionVault(userId: string): LectureSession[] {
  try {
    const raw = localStorage.getItem(`${USER_VAULT_PREFIX}${userId}`);
    if (raw) return JSON.parse(raw);
    return getStoredSessions();
  } catch {
    return getStoredSessions();
  }
}

export function syncUserSessions(userId: string, sessions: LectureSession[]): void {
  try {
    localStorage.setItem(`${USER_VAULT_PREFIX}${userId}`, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to sync user session vault', e);
  }
}

