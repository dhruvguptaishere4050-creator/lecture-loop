import { CaptionSegment, LectureSession } from '../types';

export interface AudioUploadResult {
  session: LectureSession;
  segments: CaptionSegment[];
}

/**
 * Extracts the exact duration of an uploaded audio file using the Web Audio API / HTMLAudioElement
 */
export async function getAudioFileDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.src = url;

      audio.onloadedmetadata = () => {
        const dur = Math.round(audio.duration);
        URL.revokeObjectURL(url);
        resolve(dur > 0 && isFinite(dur) ? dur : 120);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(120); // Fallback standard lecture snippet
      };

      // Timeout fallback in case metadata doesn't fire
      setTimeout(() => {
        resolve(120);
      }, 3000);
    } catch {
      resolve(120);
    }
  });
}

/**
 * Generates academic timestamped moments calibrated to the exact duration of an uploaded audio file.
 */
export function generateMomentsForAudio(
  sessionId: string,
  totalDuration: number,
  topicHint: string = 'General Biology'
): CaptionSegment[] {
  const duration = Math.max(30, totalDuration);
  const segmentInterval = Math.max(10, Math.min(25, Math.floor(duration / 10)));
  const count = Math.max(4, Math.floor(duration / segmentInterval));

  const biologyTemplates = [
    { text: "Welcome to this lecture session. We begin by examining core biochemical pathways and cellular structures.", confidence: 0.96 },
    { text: "Notice the high-energy intermediate molecules synthesized during the preliminary activation phases.", confidence: 0.91 },
    { text: "Enzymatic catalysis significantly lowers activation energy, speeding reactions by factors of ten thousand.", confidence: 0.89 },
    { text: "Membrane transport mechanisms maintain electrochemical gradients essential for cellular homeostasis.", confidence: 0.93 },
    { text: "Key cofactor molecules like ATP and NADPH shuttle vital electrons across metabolic boundaries.", confidence: 0.95 },
    { text: "Feedback inhibition regulates enzyme velocities, preventing toxic accumulation of metabolic end products.", confidence: 0.87 },
    { text: "In this phase, allosteric binding alters substrate affinity and stabilizes the active conformational state.", confidence: 0.92 },
    { text: "Signal transduction cascades propagate extracellular stimuli directly to nuclear transcription factors.", confidence: 0.94 },
    { text: "Observe the molecular stoichiometry: for every cycle completed, multiple ATP equivalents are consumed.", confidence: 0.90 },
    { text: "Review these fundamental mechanisms carefully as they form the primary foundation for upcoming laboratory exams.", confidence: 0.97 }
  ];

  const genericTemplates = [
    { text: `Beginning our analysis of ${topicHint}. Let us review the primary theorems and structural assumptions.`, confidence: 0.95 },
    { text: "Pay close attention to this foundational concept, as it directly governs all subsequent derivations.", confidence: 0.92 },
    { text: "Notice how these interrelated variables respond dynamically to external perturbations.", confidence: 0.88 },
    { text: "Quantitative precision is essential when interpreting these experimental observations.", confidence: 0.94 },
    { text: "Here we identify a common pitfall: confusing instantaneous rates with steady-state equilibria.", confidence: 0.90 },
    { text: "Synthesizing these observations leads us directly to the core predictive model.", confidence: 0.96 }
  ];

  const pool = topicHint.toLowerCase().includes('bio') ? biologyTemplates : genericTemplates;
  const segments: CaptionSegment[] = [];

  for (let i = 0; i < count; i++) {
    const startSeconds = Math.round(i * (duration / count));
    const endSeconds = Math.round(Math.min(duration, (i + 1) * (duration / count)));
    const template = pool[i % pool.length];

    segments.push({
      id: `seg-${sessionId}-${i + 1}`,
      sessionId,
      sequenceNumber: i + 1,
      startSeconds,
      endSeconds,
      originalText: template.text,
      isEdited: false,
      confidence: template.confidence
    });
  }

  return segments;
}

/**
 * High-Traffic Stress Test Generator:
 * Generates 250 - 1000 micro-segments to demonstrate high load, zero lag, and instant search performance.
 */
export function generateStressTestLecture(segmentCount: number = 250): AudioUploadResult {
  const sessionId = `stress-test-${Date.now()}`;
  const totalDuration = segmentCount * 4; // 4 seconds per segment

  const session: LectureSession = {
    id: sessionId,
    title: `⚡ High-Traffic Stress Corpus (${segmentCount} Timestamped Moments)`,
    subject: 'High-Concurrency Systems',
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    duration: totalDuration,
    createdAt: Date.now(),
    notes: `Simulated high-load benchmark containing ${segmentCount} real-time indexed moments for stress-testing search and audio scrubbing.`
  };

  const vocabulary = [
    'RuBisCO', 'Thylakoid', 'ATP Synthase', 'Photophosphorylation', 'Stroma',
    'Chlorophyll-a', 'Photosystem II', 'Cytochrome b6f', 'Calvin Cycle',
    '3-Phosphoglycerate', 'NADPH', 'Granum', 'Plastoquinone', 'Plastocyanin',
    'Ferredoxin', 'Carboxylation', 'Ribulose 1,5-bisphosphate', 'Glyceraldehyde-3-phosphate',
    'Chemiosmosis', 'Photolysis'
  ];

  const segments: CaptionSegment[] = [];

  for (let i = 0; i < segmentCount; i++) {
    const term = vocabulary[i % vocabulary.length];
    const startSec = i * 4;
    const endSec = (i + 1) * 4;

    segments.push({
      id: `stress-seg-${i + 1}`,
      sessionId,
      sequenceNumber: i + 1,
      startSeconds: startSec,
      endSeconds: endSec,
      originalText: `Moment ${i + 1}: Investigating kinetic reaction rates of ${term} inside dense cellular micro-environments.`,
      isEdited: i % 15 === 0, // Some pre-edited
      correctedText: i % 15 === 0 ? `Moment ${i + 1}: Student verified kinetic reaction rates of ${term} inside dense cellular micro-environments.` : undefined,
      confidence: Math.round((0.85 + (i % 15) * 0.01) * 100) / 100
    });
  }

  return { session, segments };
}
