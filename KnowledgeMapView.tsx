import React, { useState } from 'react';
import { LectureSession, CaptionSegment, KnowledgeNode, KnowledgeMapData } from '../types';
import { generateKnowledgeMap } from '../utils/aiEngine';
import { 
  Network, Sparkles, Clock, ArrowRight, ArrowUpRight, 
  Layers, Info, Zap, Compass, CheckCircle2 
} from 'lucide-react';

interface KnowledgeMapViewProps {
  session: LectureSession;
  segments: CaptionSegment[];
  onJumpToMoment: (seconds: number) => void;
}

export const KnowledgeMapView: React.FC<KnowledgeMapViewProps> = ({
  session,
  segments,
  onJumpToMoment
}) => {
  const mapData: KnowledgeMapData = generateKnowledgeMap(session, segments);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(mapData.nodes[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const selectedNode = mapData.nodes.find(n => n.id === selectedNodeId) || mapData.nodes[0];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getCategoryColor = (category: KnowledgeNode['category']) => {
    switch (category) {
      case 'core': return { bg: 'bg-cyan-400/20', border: 'border-cyan-400', text: 'text-cyan-glow', badge: 'bg-cyan-glow text-slate-900 font-bold' };
      case 'process': return { bg: 'bg-[#8B5CF6]/20', border: 'border-[#8B5CF6]', text: 'text-[#A78BFA]', badge: 'bg-[#8B5CF6] text-white font-bold' };
      case 'structure': return { bg: 'bg-[#05F292]/20', border: 'border-[#05F292]', text: 'text-[#05F292]', badge: 'bg-[#05F292] text-slate-900 font-bold' };
      case 'molecule': return { bg: 'bg-[#FFB454]/20', border: 'border-[#FFB454]', text: 'text-[#FFD199]', badge: 'bg-[#FFB454] text-slate-900 font-bold' };
      case 'outcome': return { bg: 'bg-sky-400/20', border: 'border-sky-400', text: 'text-sky-300', badge: 'bg-sky-400 text-slate-900 font-bold' };
      default: return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white', badge: 'bg-white/20 text-white font-bold' };
    }
  };

  const connectedOutgoing = mapData.edges.filter(e => e.from === selectedNode?.id);
  const connectedIncoming = mapData.edges.filter(e => e.to === selectedNode?.id);

  const filteredNodes = filterCategory === 'all' 
    ? mapData.nodes 
    : mapData.nodes.filter(n => n.category === filterCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 3D Glass Header Card */}
      <div className="glass-elevated-3d p-6 sm:p-7 relative overflow-hidden mirror-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-glow text-xs font-mono font-bold mb-3 shadow-sm">
              <Network className="w-3.5 h-3.5 text-cyan-glow" />
              <span>Semantic Concept Graph</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
              Knowledge Map & Concept Relations
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Visualizes how biochemical structures, molecular reactants, and metabolic stages connect together during the lecture. Click any node to scrub audio directly to that concept.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-cyan-glow bg-white/[0.05] px-3.5 py-1.5 rounded-xl border border-white/10 shadow-inner font-bold">
              {mapData.nodes.length} Concepts • {mapData.edges.length} Semantic Links
            </span>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-cyan-glow/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All Nodes' },
          { key: 'core', label: 'Core Photons' },
          { key: 'structure', label: 'Cellular Structures' },
          { key: 'molecule', label: 'Enzymes & Molecules' },
          { key: 'process', label: 'Metabolic Processes' },
          { key: 'outcome', label: 'End Products' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilterCategory(cat.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all font-mono ${
              filterCategory === cat.key
                ? 'btn-3d-cyan text-slate-900 font-extrabold shadow-3d-button'
                : 'btn-3d-obsidian text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Map Layout: Left Interactive Visual Graph, Right Concept Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Columns: Visual Node Network Card */}
        <div className="lg:col-span-2 glass-3d p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-glow" />
                <span>Interactive Concept Nodes</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Click node to inspect & jump</span>
            </div>

            {/* Grid of Concept Cards / Interactive Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {filteredNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const colors = getCategoryColor(node.category);

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? `${colors.bg} ${colors.border} shadow-3d-button scale-[1.02]`
                        : 'bg-black/30 border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${colors.badge}`}>
                        {node.category}
                      </span>
                      <span className="text-[11px] font-mono text-cyan-glow flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(node.timestampSeconds)}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#F1F5F9] mb-1">
                      {node.label}
                    </h4>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {node.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sequential Energy Path */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-xs font-bold text-cyan-glow uppercase tracking-wider block mb-2 font-mono">
              Linear Energy Flow Sequence:
            </span>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-mono text-slate-300">
              <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[#F1F5F9] whitespace-nowrap">Photons</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-glow flex-shrink-0" />
              <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[#F1F5F9] whitespace-nowrap">PSII (P680)</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-glow flex-shrink-0" />
              <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[#F1F5F9] whitespace-nowrap">Lumen H⁺</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-glow flex-shrink-0" />
              <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[#F1F5F9] whitespace-nowrap">ATP Synthase</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-glow flex-shrink-0" />
              <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[#F1F5F9] whitespace-nowrap">Calvin Cycle</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-glow flex-shrink-0" />
              <span className="px-2.5 py-1 rounded bg-[#05F292]/20 text-[#05F292] border border-[#05F292]/40 whitespace-nowrap font-bold">G3P Sugar</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Node Deep Dive */}
        {selectedNode && (
          <div className="glass-3d p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded ${getCategoryColor(selectedNode.category).badge}`}>
                  {selectedNode.category}
                </span>
                <span className="text-xs font-mono text-cyan-glow flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(selectedNode.timestampSeconds)}</span>
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#F1F5F9]">
                {selectedNode.label}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedNode.summary}
              </p>
            </div>

            {/* Jump Button */}
            <button
              onClick={() => onJumpToMoment(selectedNode.timestampSeconds)}
              className="btn-3d-cyan w-full py-2.5 text-xs font-extrabold shadow-3d-button flex items-center justify-center space-x-2"
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Jump to Audio at {formatTime(selectedNode.timestampSeconds)}</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {/* Relational Connections */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-cyan-glow uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-cyan-glow" />
                <span>Relational Links:</span>
              </h4>

              {connectedOutgoing.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-mono">Outputs to:</span>
                  {connectedOutgoing.map((edge, i) => {
                    const target = mapData.nodes.find(n => n.id === edge.to);
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedNodeId(edge.to)}
                        className="p-2.5 rounded-xl bg-black/30 hover:bg-white/[0.06] border border-white/10 cursor-pointer text-xs flex items-center justify-between text-slate-300 hover:text-white transition-colors"
                      >
                        <span className="font-semibold">{target?.label || edge.to}</span>
                        <span className="text-[11px] font-mono text-cyan-glow">{edge.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {connectedIncoming.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-mono">Inputs from:</span>
                  {connectedIncoming.map((edge, i) => {
                    const source = mapData.nodes.find(n => n.id === edge.from);
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedNodeId(edge.from)}
                        className="p-2.5 rounded-xl bg-black/30 hover:bg-white/[0.06] border border-white/10 cursor-pointer text-xs flex items-center justify-between text-slate-300 hover:text-white transition-colors"
                      >
                        <span className="font-semibold">{source?.label || edge.from}</span>
                        <span className="text-[11px] font-mono text-[#A78BFA]">{edge.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hackathon BT-14 Context note */}
            {selectedNode.id === 'rubisco' && (
              <div className="p-3 bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 rounded-xl text-xs text-[#F1F5F9]">
                <div className="font-bold text-[#A78BFA] mb-1 flex items-center space-x-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>BT-14 Highlight Term</span>
                </div>
                RuBisCO is the primary benchmark acoustic confusion word. Students corrected "Rudy's co" to "RuBisCO" at timestamp 01:05.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
