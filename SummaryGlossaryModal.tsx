import React from 'react';
import { X, Sparkles, BookOpen, Clock, ArrowRight, Lightbulb, ArrowUpRight } from 'lucide-react';
import { KEY_CONCEPTS_GLOSSARY } from '../utils/storage';

interface SummaryGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToMoment?: (seconds: number) => void;
}

export const SummaryGlossaryModal: React.FC<SummaryGlossaryModalProps> = ({
  isOpen,
  onClose,
  onJumpToMoment
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071426]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10243D] rounded-2xl max-w-3xl w-full shadow-ocean-elevated border border-[rgba(130,183,255,0.18)] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#071426] text-[#EAF2FF] px-6 py-4 flex items-center justify-between border-b border-[rgba(130,183,255,0.12)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#9B8CFF]/20 text-[#9B8CFF] rounded-xl border border-[#9B8CFF]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold tracking-tight">5-Minute Lecture Summary & Linked Glossary</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#193653] text-[#82B7FF] border border-[rgba(130,183,255,0.2)]">
                  BT-14 Stretch Feature
                </span>
              </div>
              <p className="text-xs text-[#A9BCD4]">Key scientific concepts linked back to their supporting lecture moments</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6D86A8] hover:text-[#EAF2FF] rounded-lg hover:bg-[#193653] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#10243D]">
          
          {/* 5-Minute Structured Summary */}
          <div className="bg-[#152C48] rounded-2xl border border-[rgba(130,183,255,0.14)] p-5 shadow-ocean-card">
            <div className="flex items-center space-x-2 text-[#82B7FF] font-bold text-xs uppercase tracking-wider mb-3">
              <Lightbulb className="w-4 h-4 text-[#3987FF]" />
              <span>Core Takeaway Summary</span>
            </div>

            <ul className="space-y-3 text-xs text-[#A9BCD4] leading-relaxed">
              <li className="flex items-start space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-[#3987FF] mt-1.5 shrink-0" />
                <span><strong className="text-[#EAF2FF]">Chloroplast Architecture & Light Reactions:</strong> Light is absorbed in thylakoid membranes by chlorophyll pigment complexes, exciting electrons in photosystem II and driving photophosphorylation.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-[#9B8CFF] mt-1.5 shrink-0" />
                <span><strong className="text-[#EAF2FF]">Energy Generation:</strong> Water photolysis generates molecular oxygen and establishes a steep proton gradient into the lumen, driving the rotary catalysis of ATP-synthase to charge ATP and reduce NADPH.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-[#35C98A] mt-1.5 shrink-0" />
                <span><strong className="text-[#EAF2FF]">Carbon Fixation & RuBisCO:</strong> In the stroma, RuBisCO fixes atmospheric CO₂ into 3-phosphoglycerate, which is reduced to glyceraldehyde-3-phosphate, regenerating ribulose-1,5-bisphosphate and synthesizing hexose sugars.</span>
              </li>
            </ul>
          </div>

          {/* Interactive Linked Key Concepts Glossary */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#3987FF]" />
                <h3 className="text-sm font-bold text-[#EAF2FF]">Linked Concept Glossary</h3>
              </div>
              <span className="text-xs text-[#A9BCD4]">Click moment to scrub directly in audio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {KEY_CONCEPTS_GLOSSARY.map((concept) => (
                <div
                  key={concept.id}
                  className="bg-[#152C48] border border-[rgba(130,183,255,0.12)] hover:border-[rgba(57,135,255,0.4)] rounded-xl p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#EAF2FF]">{concept.term}</span>
                      <button
                        onClick={() => {
                          onJumpToMoment?.(concept.timestampSeconds);
                          onClose();
                        }}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#071426] text-[#82B7FF] hover:bg-[#3987FF] hover:text-white text-[11px] font-mono font-semibold transition-colors"
                      >
                        <Clock className="w-3 h-3" />
                        <span>[{formatTime(concept.timestampSeconds)}]</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#A9BCD4] leading-relaxed">
                      {concept.definition}
                    </p>
                  </div>

                  <div className="pt-2 mt-3 border-t border-[rgba(130,183,255,0.08)] flex justify-end">
                    <button
                      onClick={() => {
                        onJumpToMoment?.(concept.timestampSeconds);
                        onClose();
                      }}
                      className="text-[11px] text-[#3987FF] hover:text-[#82B7FF] font-semibold flex items-center space-x-1"
                    >
                      <span>Jump to lecture audio</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#071426] border-t border-[rgba(130,183,255,0.1)] px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3987FF] hover:bg-[#2974EB] text-white font-bold rounded-xl text-xs transition-all shadow-electric-glow"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
