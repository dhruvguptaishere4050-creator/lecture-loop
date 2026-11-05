import React, { useState } from 'react';
import { LectureSession, CaptionSegment, QuizQuestion } from '../types';
import { generateLectureQuiz } from '../utils/aiEngine';
import { 
  CheckCircle2, XCircle, RotateCcw, Clock, HelpCircle, 
  Sparkles, Award, ArrowUpRight, Check, AlertCircle, 
  Trophy, ChevronRight
} from 'lucide-react';

interface QuizGeneratorViewProps {
  session: LectureSession;
  segments: CaptionSegment[];
  onJumpToMoment: (seconds: number) => void;
}

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({
  session,
  segments,
  onJumpToMoment
}) => {
  const [questions] = useState<QuizQuestion[]>(() => generateLectureQuiz(session, segments));
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return; // Prevent changing after submission
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  const score = calculateScore();
  const allAnswered = questions.every(q => userAnswers[q.id] !== undefined);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 3D Glass Header Card */}
      <div className="glass-elevated-3d p-6 sm:p-7 relative overflow-hidden mirror-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] text-xs font-mono font-bold mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>AI Self-Assessment Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
              Concept Mastery Quiz
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Dynamically synthesized questions covering critical terminology, formulas, and key moments from <span className="text-cyan-glow font-bold">{session.title}</span>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetQuiz}
              className="btn-3d-obsidian inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-glow" />
              <span>Reset Quiz</span>
            </button>

            {!submitted && (
              <button
                onClick={() => setSubmitted(true)}
                disabled={!allAnswered}
                className={`btn-3d-cyan inline-flex items-center space-x-2 px-5 py-2 text-xs font-extrabold shadow-3d-button ${
                  !allAnswered ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <span>Submit Answers</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Results Banner when Submitted */}
      {submitted && (
        <div className={`p-6 rounded-2xl border transition-all mirror-surface ${
          score.percentage >= 80 
            ? 'glass-elevated-3d border-[#05F292]/40 bg-gradient-to-r from-black/60 to-[#05F292]/10'
            : 'glass-elevated-3d border-[#FFB454]/40 bg-gradient-to-r from-black/60 to-[#FFB454]/10'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                score.percentage >= 80 ? 'bg-[#05F292]/20 text-[#05F292]' : 'bg-[#FFB454]/20 text-[#FFB454]'
              }`}>
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F1F5F9]">
                  {score.percentage >= 80 ? 'Exceptional Recall!' : 'Good Effort! Review Recommended'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  You answered <span className="font-bold text-cyan-glow">{score.correct}</span> out of <span className="font-bold text-cyan-glow">{score.total}</span> questions correctly ({score.percentage}%).
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-3xl font-extrabold text-[#F1F5F9] font-mono">
                  {score.percentage}%
                </div>
                <div className="text-[11px] text-cyan-glow uppercase font-bold tracking-wider font-mono">
                  Mastery Index
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {questions.map((q, qIndex) => {
          const selectedOption = userAnswers[q.id];
          const isAnswered = selectedOption !== undefined;
          const isCorrect = submitted && selectedOption === q.correctIndex;
          const isWrong = submitted && selectedOption !== q.correctIndex;

          return (
            <div
              key={q.id}
              className={`glass-3d p-6 transition-all ${
                submitted 
                  ? isCorrect 
                    ? 'border-[#05F292]/50'
                    : 'border-red-500/50'
                  : 'hover:border-cyan-400/40'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-cyan-400/15 text-cyan-glow border border-cyan-400/30 flex items-center justify-center font-mono font-bold text-xs mt-0.5">
                    {qIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#F1F5F9] leading-snug">
                      {q.question}
                    </h3>
                    <div className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-glow mt-1.5">
                      <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                      <span>Concept: {q.keyConcept}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onJumpToMoment(q.relatedTimestamp)}
                  className="flex-shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-400/20 text-cyan-glow hover:text-white font-mono text-xs font-semibold border border-white/10 transition-colors"
                  title="Jump to lecture audio at this timestamp"
                >
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(q.relatedTimestamp)}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mt-4">
                {q.options.map((option, optIdx) => {
                  const isThisSelected = selectedOption === optIdx;
                  const isThisCorrect = optIdx === q.correctIndex;

                  let optionStyle = 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/[0.05] hover:text-[#F1F5F9]';

                  if (submitted) {
                    if (isThisCorrect) {
                      optionStyle = 'bg-[#05F292]/15 border-[#05F292] text-[#F1F5F9] font-semibold';
                    } else if (isThisSelected && !isThisCorrect) {
                      optionStyle = 'bg-red-500/15 border-red-500 text-[#F1F5F9] font-semibold';
                    } else {
                      optionStyle = 'bg-black/20 border-white/5 text-slate-500';
                    }
                  } else if (isThisSelected) {
                    optionStyle = 'bg-cyan-400/20 border-cyan-400 text-white font-bold shadow-3d-button';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      disabled={submitted}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-5 h-5 rounded-lg border flex items-center justify-center font-mono text-[11px] font-bold ${
                          submitted && isThisCorrect 
                            ? 'bg-[#05F292] border-[#05F292] text-slate-900'
                            : submitted && isThisSelected && !isThisCorrect
                            ? 'bg-red-500 border-red-500 text-white'
                            : isThisSelected 
                            ? 'bg-cyan-glow border-cyan-glow text-slate-900'
                            : 'border-white/20 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {submitted && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#05F292] flex-shrink-0 ml-2" />
                      )}
                      {submitted && isThisSelected && !isThisCorrect && (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown when submitted) */}
              {submitted && (
                <div className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${
                  isCorrect 
                    ? 'bg-[#05F292]/10 border-[#05F292]/30 text-[#F1F5F9]'
                    : 'bg-black/40 border-white/10 text-slate-300'
                }`}>
                  <div className="flex items-center space-x-1.5 font-bold mb-1 text-cyan-glow">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Explanation & Audio Context:</span>
                  </div>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
