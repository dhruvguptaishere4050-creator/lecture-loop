import React from 'react';
import { X, FileText, Copy, Check } from 'lucide-react';

interface ReferenceScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceScriptModal: React.FC<ReferenceScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const scriptText = `Good morning class. Today we will thoroughly examine photosynthesis inside the living plant cell. Solar energy is captured inside specialized double-membrane organelles termed chloroplasts. Suspended within the stroma is a dense stack of flattened sacs called the thylakoid system. Embedded in these membranes are green pigment clusters known as chlorophyll molecules.

When light activates photosystem two, electrons get excited, initiating photophosphorylation across the electron transport chain. Simultaneously, water undergoes photolysis, discharging free protons and oxygen into the inner lumen. This proton gradient drives the molecular motor ATP-synthase to produce cellular energy. High-energy electrons reduce NADP-plus into NADPH with the electron shuttle ferredoxin.

Now in the stroma's Calvin-cycle, the primary enzyme RuBisCO fixes atmospheric carbon dioxide. RuBisCO carboxylates ribulose-1,5-bisphosphate into 3-phosphoglycerate, which reduces into glyceraldehyde-3-phosphate, producing hexose sugars and completing regeneration.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071426]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10243D] rounded-2xl max-w-2xl w-full shadow-ocean-elevated border border-[rgba(130,183,255,0.18)] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#071426] text-[#EAF2FF] px-6 py-4 flex items-center justify-between border-b border-[rgba(130,183,255,0.12)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#3987FF]/20 text-[#3987FF] rounded-xl border border-[#3987FF]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">2-Minute Reference Lesson Script</h2>
              <p className="text-xs text-[#A9BCD4]">Pre-constructed text embedded with 20 technical evaluation terms</p>
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm bg-[#10243D]">
          <div className="bg-[#152C48] border border-[rgba(130,183,255,0.14)] rounded-xl p-3.5 text-xs flex items-center justify-between">
            <span className="text-[#82B7FF]">Contains 20 predefined biological keywords highlighted below for speech model testing.</span>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#3987FF] text-white font-bold hover:bg-[#2974EB] shadow-electric-glow transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#35C98A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>

          <div className="bg-[#071426] border border-[rgba(130,183,255,0.12)] rounded-xl p-5 leading-relaxed text-[#EAF2FF] text-sm sm:text-base space-y-4">
            <p>
              "Good morning class. Today we will thoroughly examine <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">photosynthesis</strong> inside the living plant cell. Solar energy is captured inside specialized double-membrane organelles termed <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">chloroplasts</strong>. Suspended within the <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">stroma</strong> is a dense stack of flattened sacs called the <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">thylakoid</strong> system. Embedded in these membranes are green pigment clusters known as <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">chlorophyll</strong> molecules.
            </p>
            <p>
              When light activates <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">photosystem</strong> two, electrons get excited, initiating <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">photophosphorylation</strong> across the electron transport chain. Simultaneously, water undergoes <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">photolysis</strong>, discharging free protons and oxygen into the inner <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">lumen</strong>. This proton gradient drives the molecular motor <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">ATP-synthase</strong> to produce cellular energy. High-energy electrons reduce <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">NADP-plus</strong> into <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">NADPH</strong> with the electron shuttle <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">ferredoxin</strong>.
            </p>
            <p>
              Now in the stroma's <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">Calvin-cycle</strong>, the primary enzyme <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">RuBisCO</strong> fixes atmospheric carbon dioxide. RuBisCO carboxylates <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">ribulose-1,5-bisphosphate</strong> into <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">3-phosphoglycerate</strong>, which reduces into <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">glyceraldehyde-3-phosphate</strong>, producing <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">hexose</strong> sugars and completing <strong className="text-[#82B7FF] bg-[#193653] px-1.5 py-0.5 rounded font-mono">regeneration</strong>."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#071426] border-t border-[rgba(130,183,255,0.1)] px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3987FF] hover:bg-[#2974EB] text-white font-bold rounded-xl text-xs transition-all shadow-electric-glow"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
