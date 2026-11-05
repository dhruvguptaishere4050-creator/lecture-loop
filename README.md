# 🎙️ LectureLoop — Classroom Acoustic Recovery & Lecture Capture AI

> *"Find the part you missed, hear it again, and fix the words the AI misunderstood."*

**LectureLoop** is a production-grade, 100% offline, privacy-first lecture capture and study platform engineered for universities and high-concurrency academic environments. Built for the **BIOS Seed Build Lab (Track BT-14)**, LectureLoop solves classroom acoustic degradation, accented terminology confusion, and passive lecture recording through real-time audio-synchronized transcripts and transparent student error corrections.

---

## ✨ Key Features

### 🎧 Precision Audio Scrubber & Searchable Moments
- **Sub-Millisecond Search**: Debounced indexing across hundreds of lecture moments with instant audio scrubbing.
- **Pre-Roll Context Audio**: Jumps 3 seconds prior to key moments to preserve the speaker's conceptual context.
- **Waveform Telemetry HUD**: Real-time acoustic capture state, audio playback position, and engine latency monitoring.

### ✍️ Correction Transparency Principle
- **Student Error Fixes**: Students can correct phonetic speech-recognition mistakes (e.g., *"Rudy's co"* $\rightarrow$ *"RuBisCO"*) without mutating or deleting raw teacher audio.
- **Three-Way Provenance Audit**: Toggle between **Student-Corrected**, **Raw AI Recognizer**, and **Side-by-Side Diff** view modes.

### 📥 External Audio Upload & Ingestion
- Drag-and-drop or upload `.mp3`, `.wav`, `.m4a`, `.aac`, `.flac`, or `.webm` recordings up to 250MB.
- Automatic duration calculation and synchronized timestamped moment generation.

### 🏛️ Classroom Authentication Portal
- Academic classroom UI themed in **pristine white, chalkboard black, and warm gold accents**.
- **1-Click Google Sign-In**: Instant profile creation with automatic session sync.
- **Passwordless Gmail Magic Link**: Interactive email verification simulation with token validation.

### 📚 AI-Powered Study Modules
- **Cornell Structured Notes**: Executive summaries, formula indices, and chronological phase breakdowns with audio jump links.
- **Concept Mastery Quiz**: Auto-generated MCQ quizzes with mastery metrics and timestamp explanations.
- **3D Semantic Knowledge Map**: Interactive relational concept graph showing biochemical pathways and metabolic sequences.
- **Speech Cadence Analytics**: Real-time Words-Per-Minute (WPM), acoustic confidence, and term density distribution.

---

## ⚡ Performance & Scalability

- **Route-Level Code-Splitting**: Modular `React.lazy` and `Suspense` loading for study tools, keeping initial bundle size minimal.
- **Progressive Virtual Batching**: Efficient 50-moment batch rendering to prevent DOM thrashing on long lectures.
- **Direct DOM Manipulation**: Zero-lag audio scrubber timeline updates without triggering React re-renders.
- **Stress-Test Generator**: Includes built-in simulation for 300+ concurrent moments with instantaneous filtering.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Bundler & Dev Server** | [Vite 8](https://vitejs.dev/) |
| **Styling & 3D Glass** | [Tailwind CSS v3](https://tailwindcss.com/) + Custom Specular CSS Bevels |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Audio Processing** | Web Audio API + HTML5 Audio + Web Speech API |
| **Persistence** | LocalStorage + User Vault Sync |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/lectureloop.git
cd lectureloop

# Install dependencies
npm install

# Start development server
npm run dev
