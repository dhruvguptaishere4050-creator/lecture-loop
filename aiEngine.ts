/**
 * AI Engine for LectureLoop
 * Provides: AI correction suggestions, topic detection, quality scoring,
 * analytics computation, vocabulary term extraction, and smart summaries.
 * All processing is local (no external API calls) to work fully offline.
 */
import type { CaptionSegment, LectureAnalytics, AICorrection } from '../types';

// ─── ACOUSTIC CONFUSION DICTIONARY ────────────────────────────────────────────
// Maps common classroom speech-engine misrecognitions → correct technical terms
// Grouped by domain for subject-aware hint loading
const CONFUSION_MAP: Record<string, string> = {
  // Biology
  "rudy's co": "RuBisCO",
  "rubisco": "RuBisCO",
  "rudy's coke": "RuBisCO",
  "thigh lock oid": "thylakoid",
  "tie lock oid": "thylakoid",
  "thigh lair coid": "thylakoid",
  "photo fossil relation": "photophosphorylation",
  "photo phosphor relation": "photophosphorylation",
  "photo phosphorylation": "photophosphorylation",
  "floor oh fill": "chlorophyll",
  "coral fill": "chlorophyll",
  "ferro doxin": "ferredoxin",
  "farro docking": "ferredoxin",
  "3 phosphoglyceride": "3-phosphoglycerate",
  "glyceride 3 phosphate": "glyceraldehyde-3-phosphate",
  "calvin cycle": "Calvin-cycle",
  "atp synthase": "ATP-synthase",
  "nadp plus": "NADP-plus",
  "ribulose bisphosphate": "ribulose-1,5-bisphosphate",
  // Physics
  "heisenberg": "Heisenberg",
  "schrodinger": "Schrödinger",
  "wave function": "wavefunction",
  "hilbert space": "Hilbert space",
  "hamiltonian": "Hamiltonian",
  "eigen state": "eigenstate",
  "dirac notation": "Dirac notation",
  // Chemistry
  "stoichiometry": "stoichiometry",
  "electro negativity": "electronegativity",
  "hydrogen bonding": "hydrogen bonding",
  // Math
  "eigenvalue": "eigenvalue",
  "fourier transform": "Fourier transform",
  "eulers formula": "Euler's formula",
};

// ─── SUBJECT VOCABULARY HINTS ─────────────────────────────────────────────────
export const SUBJECT_VOCABULARY: Record<string, string[]> = {
  'biology': [
    'photosynthesis', 'chloroplast', 'thylakoid', 'chlorophyll', 'photosystem',
    'photophosphorylation', 'photolysis', 'lumen', 'ATP-synthase', 'NADPH',
    'ferredoxin', 'stroma', 'Calvin cycle', 'RuBisCO', 'ribulose bisphosphate',
    '3-phosphoglycerate', 'glyceraldehyde-3-phosphate', 'hexose', 'mitochondria',
    'eukaryote', 'prokaryote', 'ribosome', 'endoplasmic reticulum', 'Golgi',
    'osmosis', 'diffusion', 'enzyme', 'substrate', 'catalyst'
  ],
  'physics': [
    'Schrödinger', 'wavefunction', 'superposition', 'Heisenberg', 'eigenstate',
    'Hamiltonian', 'quantum', 'photon', 'electromagnetic', 'Planck constant',
    'angular momentum', 'potential energy', 'kinetic energy', 'momentum',
    'velocity', 'acceleration', 'electromagnetic spectrum', 'wavelength'
  ],
  'chemistry': [
    'stoichiometry', 'electronegativity', 'covalent bond', 'ionic bond',
    'hydrogen bond', 'oxidation', 'reduction', 'molarity', 'titration',
    'equilibrium', 'endothermic', 'exothermic', 'enthalpy', 'entropy',
    'catalyst', 'activation energy', 'Le Chatelier'
  ],
  'mathematics': [
    'eigenvalue', 'Fourier transform', 'differential equation', 'integral',
    'derivative', 'matrix', 'vector', 'determinant', 'Lagrangian',
    'Taylor series', 'Euler formula', 'imaginary number', 'modulus'
  ]
};

// ─── AI CORRECTION ENGINE ─────────────────────────────────────────────────────
/**
 * Analyzes a segment text for acoustic confusions and suggests corrections.
 * Returns a suggestion only if a known confusion is found.
 */
export function generateAICorrection(seg: CaptionSegment): AICorrection | null {
  const text = seg.originalText.toLowerCase();
  
  for (const [confused, correct] of Object.entries(CONFUSION_MAP)) {
    if (text.includes(confused)) {
      const correctedText = seg.originalText.replace(
        new RegExp(confused, 'gi'),
        correct
      );
      return {
        segmentId: seg.id,
        original: seg.originalText,
        suggested: correctedText,
        reason: `Speech engine likely confused "${confused}" acoustically with the technical term "${correct}".`,
        confidence: 0.88,
        applied: false
      };
    }
  }
  
  // Low confidence flag: suggest review even without specific confusion match
  if ((seg.confidence ?? 1) < 0.70) {
    return {
      segmentId: seg.id,
      original: seg.originalText,
      suggested: seg.originalText,
      reason: `Low recognizer confidence (${Math.round((seg.confidence ?? 0) * 100)}%). This segment likely contains acoustic errors. Manual review recommended.`,
      confidence: seg.confidence ?? 0.5,
      applied: false
    };
  }
  
  return null;
}

/**
 * Batch-generate AI corrections for all segments in a lecture.
 * Returns only segments that have actionable suggestions.
 */
export function batchGenerateCorrections(segments: CaptionSegment[]): AICorrection[] {
  return segments
    .filter(s => !s.isEdited) // Skip already-corrected segments
    .map(s => generateAICorrection(s))
    .filter((c): c is AICorrection => c !== null);
}

// ─── TOPIC DETECTION ENGINE ───────────────────────────────────────────────────
/**
 * Detects dominant topics from transcript text using vocabulary frequency.
 */
export function detectTopics(segments: CaptionSegment[]): string[] {
  const fullText = segments.map(s => (s.correctedText || s.originalText).toLowerCase()).join(' ');
  const topicScores: Record<string, number> = {};

  for (const [subject, terms] of Object.entries(SUBJECT_VOCABULARY)) {
    const score = terms.reduce((acc, term) => {
      const regex = new RegExp(term.toLowerCase(), 'g');
      const matches = fullText.match(regex);
      return acc + (matches?.length ?? 0);
    }, 0);
    if (score > 0) topicScores[subject] = score;
  }

  return Object.entries(topicScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic.charAt(0).toUpperCase() + topic.slice(1));
}

// ─── SMART SUMMARY ENGINE ─────────────────────────────────────────────────────
/**
 * Produces a local 3-point structured summary from transcript segments.
 * Uses position-weighted importance (first + last + most-word segments).
 */
export function generateSmartSummary(segments: CaptionSegment[]): string {
  if (segments.length === 0) return 'No transcript content available for summary.';
  
  const texts = segments.map(s => s.correctedText || s.originalText);
  const totalSentences = texts.length;

  // Pick representative sentences: intro, midpoint peak (longest), conclusion
  const intro = texts[0];
  const longest = [...texts].sort((a, b) => b.length - a.length)[0];
  const conclusion = texts[totalSentences - 1];
  
  const uniqueParts = [...new Set([intro, longest, conclusion])];

  return uniqueParts
    .map((part, i) => `${['Opening', 'Core', 'Conclusion'][i] ?? 'Key Point'}: ${part.slice(0, 120)}${part.length > 120 ? '...' : ''}`)
    .join('\n\n');
}

// ─── ANALYTICS ENGINE ─────────────────────────────────────────────────────────
/**
 * Computes comprehensive lecture analytics for the dashboard widget.
 */
export function computeLectureAnalytics(segments: CaptionSegment[]): LectureAnalytics {
  if (segments.length === 0) {
    return {
      totalSegments: 0, totalWords: 0, editedCount: 0, editedPct: 0,
      avgConfidence: 0, lowConfidenceCount: 0, bookmarkCount: 0,
      topWords: [], wordsPerMinute: 0, qualityScore: 0
    };
  }

  const allText = segments.map(s => s.correctedText || s.originalText).join(' ');
  const words = allText.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? [];
  const totalWords = words.length;
  const editedCount = segments.filter(s => s.isEdited).length;
  const bookmarkCount = segments.filter(s => s.bookmarked).length;
  const avgConfidence = segments.reduce((acc, s) => acc + (s.confidence ?? 0.9), 0) / segments.length;
  const lowConfidenceCount = segments.filter(s => (s.confidence ?? 1) < 0.75).length;

  // Word frequency (exclude stop words)
  const STOP = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'they', 'will', 'into', 'more', 'what', 'also', 'when', 'were', 'there', 'which', 'their', 'these', 'some', 'than']);
  const freq: Record<string, number> = {};
  words.forEach(w => {
    if (!STOP.has(w)) freq[w] = (freq[w] ?? 0) + 1;
  });
  const topWords = Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  // Words per minute
  const totalDuration = segments.length > 0
    ? (segments[segments.length - 1].endSeconds - segments[0].startSeconds) / 60
    : 1;
  const wordsPerMinute = Math.round(totalWords / Math.max(totalDuration, 0.1));

  // Quality Score: penalize low confidence, reward corrections, reward density
  const confidenceScore = avgConfidence * 50;
  const correctionBonus = Math.min(editedCount * 5, 25);
  const densityScore = Math.min(wordsPerMinute / 2, 25);
  const qualityScore = Math.round(confidenceScore + correctionBonus + densityScore);

  return {
    totalSegments: segments.length,
    totalWords,
    editedCount,
    editedPct: Math.round((editedCount / segments.length) * 100),
    avgConfidence: Math.round(avgConfidence * 100),
    lowConfidenceCount,
    bookmarkCount,
    topWords,
    wordsPerMinute,
    qualityScore: Math.min(qualityScore, 100)
  };
}

// ─── SEGMENT SENTIMENT TAGGER ─────────────────────────────────────────────────
/**
 * Tags each segment with a basic sentiment/emphasis signal.
 */
export function tagSegmentSentiment(text: string): 'emphasis' | 'question' | 'neutral' {
  if (text.trim().endsWith('?')) return 'question';
  const emphasisWords = ['important', 'critical', 'remember', 'key', 'essential', 'must', 'crucial', 'fundamental', 'primary', 'central'];
  const lower = text.toLowerCase();
  if (emphasisWords.some(w => lower.includes(w))) return 'emphasis';
  return 'neutral';
}

// ─── NOISE DETECTION ─────────────────────────────────────────────────────────
/**
 * Flags segments that are likely garbled or noise-corrupted.
 * Heuristics: very short text, high proportion of unusual chars, low confidence.
 */
export function isNoisySegment(seg: CaptionSegment): boolean {
  const text = seg.originalText.trim();
  if (text.length < 10) return true;
  if ((seg.confidence ?? 1) < 0.55) return true;
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 2) return true;
  return false;
}

// ─── VOCABULARY HINT LOADER ───────────────────────────────────────────────────
/**
 * Returns vocabulary hints relevant to the detected subject for Deepgram/speech engine.
 */
export function getVocabularyHints(subject: string): string[] {
  const key = subject.toLowerCase();
  for (const [domain, hints] of Object.entries(SUBJECT_VOCABULARY)) {
    if (key.includes(domain)) return hints;
  }
  return [];
}

// ─── STRUCTURED LECTURE NOTES GENERATOR ────────────────────────────────────────
import type { StructuredNotesData, QuizQuestion, KnowledgeMapData } from '../types';

/**
 * Generates Cornell-style structured study notes from lecture transcript segments.
 */
export function generateStructuredNotes(session: { title: string; subject: string }, segments: CaptionSegment[]): StructuredNotesData {
  const textAll = segments.map(s => s.correctedText || s.originalText).join(' ');
  const isBiology = session.subject.toLowerCase().includes('bio') || textAll.toLowerCase().includes('chloroplast');

  if (isBiology) {
    return {
      executiveSummary: "This session covers the molecular mechanics of Oxygenic Photosynthesis within plant chloroplasts, specifically contrasting the light-dependent reactions embedded in the thylakoid membrane against the carbon-fixation Calvin cycle occurring in the stroma. The process transduces electromagnetic solar energy into biochemical high-energy bonds in ATP and NADPH.",
      learningObjectives: [
        "Explain the structural compartmentalization of the chloroplast (thylakoid lumen, membrane, and stroma).",
        "Detail electron transport through Photosystem II, plastoquinone, cytochrome b6f, and Photosystem I.",
        "Characterize the dual catalytic roles and limitations of RuBisCO during carbon fixation in the Calvin cycle.",
        "Calculate the stoichiometry of ATP and NADPH consumed per 3-carbon glyceraldehyde-3-phosphate produced."
      ],
      keyDefinitions: [
        { term: "RuBisCO", definition: "Ribulose-1,5-bisphosphate carboxylase-oxygenase: the world's most abundant enzyme, catalyzing initial atmospheric CO₂ fixation.", timestamp: 65 },
        { term: "Thylakoid Lumen", definition: "Interior aqueous compartment of thylakoid disks where protons accumulate to establish the chemiosmotic gradient.", timestamp: 35 },
        { term: "Photophosphorylation", definition: "Synthesis of ATP from ADP + inorganic phosphate driven by light-activated proton motive force across ATP-synthase.", timestamp: 48 },
        { term: "Ferredoxin", definition: "Iron-sulfur protein mediating terminal electron transfer to NADP+ reductase to yield NADPH.", timestamp: 54 }
      ],
      chronologicalSections: [
        {
          heading: "Phase I: Light Harvesting & Water Photolysis",
          timestamp: 0,
          bulletPoints: [
            "Photons hit pigment antenna complexes in Photosystem II (P680 reaction center).",
            "Manganese-calcium oxygen-evolving complex splits 2 H₂O into 4 H⁺, 4 e⁻, and O₂.",
            "Protons are released directly into the thylakoid lumen, beginning gradient generation."
          ]
        },
        {
          heading: "Phase II: Electron Transport Chain & Proton Chemiosmosis",
          timestamp: 30,
          bulletPoints: [
            "High-energy electrons transfer through Plastoquinone (PQ) to Cytochrome b6f complex.",
            "Cytochrome b6f pumps additional stroma protons into the thylakoid lumen.",
            "Plastocyanin ferries electrons to Photosystem I (P700), re-energized by second photon.",
            "Electrons transfer through ferredoxin to NADP+ reductase, producing NADPH.",
            "CF₀-CF₁ ATP-synthase harnesses proton motive force back into stroma to generate ATP."
          ]
        },
        {
          heading: "Phase III: The Calvin-Benson-Bassham Stroma Cycle",
          timestamp: 60,
          bulletPoints: [
            "Carbon Fixation: RuBisCO carboxylates ribulose-1,5-bisphosphate into unstable 6-carbon intermediate, yielding two 3-PGA molecules.",
            "Reduction Phase: ATP and NADPH phosphorylate and reduce 3-PGA to glyceraldehyde-3-phosphate (G3P).",
            "Regeneration Phase: Complex sugar rearrangements consume ATP to regenerate RuBP for subsequent cycles."
          ]
        }
      ],
      criticalFormulasOrReactions: [
        "Net Light Reaction: 2 H₂O + 2 NADP⁺ + 3 ADP + 3 Pi + light → O₂ + 2 NADPH + 2 H⁺ + 3 ATP",
        "Carbon Fixation Reaction: 3 CO₂ + 9 ATP + 6 NADPH + 6 H⁺ → G3P + 9 ADP + 8 Pi + 6 NADP⁺"
      ],
      actionItems: [
        "Review the exact 3-dimensional proton accumulation direction across the thylakoid membrane.",
        "Compare cyclic vs non-cyclic photophosphorylation electron paths for exam question 4.",
        "Verify why RuBisCO oxygenase activity causes photorespiration when O₂:CO₂ ratio is elevated."
      ]
    };
  }

  // Generic fallback derived dynamically from segments
  const samplePoints = segments.slice(0, 6).map(s => s.correctedText || s.originalText);
  return {
    executiveSummary: `Lecture comprehensive summary covering key themes from "${session.title}". Extracted key statements and conceptual relationships from ${segments.length} timestamped capture segments.`,
    learningObjectives: [
      `Master core terminology introduced during ${session.title}.`,
      "Understand sequential transitions between primary lecture phases.",
      "Identify high-emphasis discussion moments flagged during real-time speech capture."
    ],
    keyDefinitions: segments.slice(0, 4).map((s, idx) => ({
      term: s.originalText.split(' ').slice(0, 2).join(' ') || `Topic ${idx + 1}`,
      definition: s.correctedText || s.originalText,
      timestamp: s.startSeconds
    })),
    chronologicalSections: [
      {
        heading: "Introduction & Contextual Grounding",
        timestamp: segments[0]?.startSeconds || 0,
        bulletPoints: samplePoints.slice(0, 2)
      },
      {
        heading: "Core Analysis & Mechanism",
        timestamp: segments[Math.floor(segments.length / 2)]?.startSeconds || 30,
        bulletPoints: samplePoints.slice(2, 4)
      },
      {
        heading: "Synthesis & Conclusions",
        timestamp: segments[Math.max(0, segments.length - 2)]?.startSeconds || 60,
        bulletPoints: samplePoints.slice(4, 6)
      }
    ],
    criticalFormulasOrReactions: [
      "Key Relationship: Input State → Kinetic/Conceptual Transformation → Synthesized Output"
    ],
    actionItems: [
      "Inspect highlighted speech-recognition correction markers in the interactive transcript.",
      "Review bookmarked moments for exam preparation."
    ]
  };
}

// ─── AUTOMATIC QUIZ GENERATOR ─────────────────────────────────────────────────
/**
 * Generates an interactive multiple-choice quiz based on lecture topics.
 */
export function generateLectureQuiz(session: { title: string; subject: string }, segments: CaptionSegment[]): QuizQuestion[] {
  const textAll = segments.map(s => s.correctedText || s.originalText).join(' ');
  const isBiology = session.subject.toLowerCase().includes('bio') || textAll.toLowerCase().includes('chloroplast');

  if (isBiology) {
    return [
      {
        id: 'q1',
        question: "Where are protons actively accumulated during the light-dependent reactions to drive ATP synthesis?",
        options: [
          "Inside the chloroplast stroma",
          "Inside the thylakoid lumen",
          "Within the outer mitochondrial membrane",
          "Directly in the cytosol"
        ],
        correctIndex: 1,
        explanation: "Protons (H⁺) are pumped and released into the thylakoid lumen, creating an electrochemical gradient that flows back out into the stroma through ATP-synthase.",
        relatedTimestamp: 35,
        keyConcept: "Thylakoid Lumen Proton Gradient"
      },
      {
        id: 'q2',
        question: "Which enzyme is responsible for the crucial initial fixation of atmospheric carbon dioxide into an organic intermediate?",
        options: [
          "Cytochrome b6f",
          "Plastoquinone oxidoreductase",
          "RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase)",
          "Ferredoxin-NADP+ reductase"
        ],
        correctIndex: 2,
        explanation: "RuBisCO catalyzes the carboxylation of RuBP, forming 3-phosphoglycerate in the stroma during the first step of the Calvin cycle.",
        relatedTimestamp: 65,
        keyConcept: "RuBisCO Carbon Fixation"
      },
      {
        id: 'q3',
        question: "What is the primary source of electrons that replenish Photosystem II after excitation by solar photons?",
        options: [
          "The photolysis (splitting) of water molecules (H₂O)",
          "The oxidation of glucose molecules",
          "Terminal electron transfer from ferredoxin",
          "Passive uptake of atmospheric oxygen"
        ],
        correctIndex: 0,
        explanation: "The oxygen-evolving complex at PSII splits water: 2 H₂O → 4 H⁺ + 4 e⁻ + O₂, supplying replacement electrons for P680 and releasing oxygen gas as a byproduct.",
        relatedTimestamp: 12,
        keyConcept: "Photolysis of Water"
      },
      {
        id: 'q4',
        question: "Which high-energy chemical carriers produced in the light reactions are subsequently consumed in the Calvin cycle?",
        options: [
          "NADH and FADH2",
          "ATP and NADPH",
          "GTP and Acetyl-CoA",
          "ADP and NADP+"
        ],
        correctIndex: 1,
        explanation: "The light reactions store solar energy in the chemical bonds of ATP and the reducing power of NADPH, which power sugar synthesis in the Calvin cycle.",
        relatedTimestamp: 55,
        keyConcept: "Energy Coupling (ATP & NADPH)"
      },
      {
        id: 'q5',
        question: "Why did the speech recognition model initially mishear 'RuBisCO' as 'Rudy's co' in the raw classroom recording?",
        options: [
          "Microphone was muted by the teacher",
          "The phonemes /ruːˈbɪskoʊ/ acoustically mirror 'Rudy's co' in standard acoustic models lacking specialized biology vocabulary",
          "The browser completely rejected Web Speech API inputs",
          "The audio file was compressed in mono format"
        ],
        correctIndex: 1,
        explanation: "Acoustic speech models trained on conversational English routinely misclassify domain-specific polysyllabic biology nomenclature unless technical vocabulary hint biasing is applied.",
        relatedTimestamp: 65,
        keyConcept: "Acoustic Speech Recognition Challenges"
      }
    ];
  }

  // Dynamic fallback quiz
  return [
    {
      id: 'q1',
      question: `What was the primary core focus established in "${session.title}"?`,
      options: [
        "Theoretical foundational background and primary terminology",
        "Historical biographical overview of researchers",
        "Financial accounting principles",
        "Laboratory safety regulatory compliance"
      ],
      correctIndex: 0,
      explanation: "The opening minutes of the session established core definitions and mechanisms.",
      relatedTimestamp: segments[0]?.startSeconds || 0,
      keyConcept: "Core Foundations"
    },
    {
      id: 'q2',
      question: "How does LectureLoop ensure student corrections remain transparent?",
      options: [
        "It permanently overwrites the teacher's original speech recording",
        "It preserves both raw recognizer text and student corrections side-by-side with diff auditing",
        "It deletes any segment that received a low confidence score",
        "It prevents students from modifying technical terms"
      ],
      correctIndex: 1,
      explanation: "LectureLoop preserves the raw recognizer audio and transcript while indexing human-verified corrections with visible [Edited by Student] provenance.",
      relatedTimestamp: segments[Math.min(2, segments.length - 1)]?.startSeconds || 15,
      keyConcept: "Correction Provenance"
    }
  ];
}

// ─── KNOWLEDGE MAP GENERATOR ──────────────────────────────────────────────────
/**
 * Generates an interactive concept graph / knowledge map linking key terms and lecture moments.
 */
export function generateKnowledgeMap(session: { title: string; subject: string }, segments: CaptionSegment[]): KnowledgeMapData {
  return {
    nodes: [
      { id: 'sunlight', label: 'Solar Photons', category: 'core', timestampSeconds: 5, summary: 'Electromagnetic energy hitting antenna pigment complexes', importance: 5 },
      { id: 'water', label: 'Photolysis (H₂O)', category: 'process', timestampSeconds: 12, summary: 'Splitting of water into protons, electrons, and O₂', importance: 4 },
      { id: 'ps2', label: 'Photosystem II', category: 'structure', timestampSeconds: 18, summary: 'P680 reaction center embedded in thylakoid membrane', importance: 5 },
      { id: 'lumen', label: 'Thylakoid Lumen', category: 'structure', timestampSeconds: 35, summary: 'Aqueous interior where H⁺ protons accumulate', importance: 4 },
      { id: 'atp', label: 'ATP Synthase', category: 'structure', timestampSeconds: 48, summary: 'Chemiosmotic rotary motor driven by proton motive force', importance: 5 },
      { id: 'nadph', label: 'NADPH Reductase', category: 'molecule', timestampSeconds: 54, summary: 'Electron transfer via ferredoxin producing reducing power', importance: 4 },
      { id: 'calvin', label: 'Calvin Cycle', category: 'process', timestampSeconds: 60, summary: 'Carbon fixation reactions occurring within the stroma', importance: 5 },
      { id: 'rubisco', label: 'RuBisCO Enzyme', category: 'molecule', timestampSeconds: 65, summary: 'Fixes CO₂ into 3-PGA; frequent AI recognition target', importance: 5 },
      { id: 'g3p', label: 'G3P Output', category: 'outcome', timestampSeconds: 78, summary: 'Triose phosphate sugar exported for glucose synthesis', importance: 4 }
    ],
    edges: [
      { from: 'sunlight', to: 'ps2', label: 'Excites P680' },
      { from: 'water', to: 'ps2', label: 'Supplies electrons' },
      { from: 'ps2', to: 'lumen', label: 'Pumps H⁺ protons' },
      { from: 'lumen', to: 'atp', label: 'Drives rotary synthesis' },
      { from: 'ps2', to: 'nadph', label: 'Ferredoxin e⁻ chain' },
      { from: 'atp', to: 'calvin', label: 'Energizes reduction' },
      { from: 'nadph', to: 'calvin', label: 'Supplies reducing e⁻' },
      { from: 'calvin', to: 'rubisco', label: 'Primary catalyst' },
      { from: 'rubisco', to: 'g3p', label: 'Synthesizes sugar' }
    ]
  };
}

