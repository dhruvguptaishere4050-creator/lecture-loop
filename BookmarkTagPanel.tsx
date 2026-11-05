import React, { useState, useMemo, useCallback } from 'react';
import type { CaptionSegment } from '../types';
import { Search, Bookmark, BookmarkCheck, Tag, Filter, X, ChevronDown, Check } from 'lucide-react';
import { saveOrUpdateSegment } from '../utils/storage';

const TAG_OPTIONS = ['Key Concept', 'Example', 'Definition', 'Formula', 'Important', 'Confusing', 'Review Needed'];

const TAG_COLORS: Record<string, string> = {
  'Key Concept': 'bg-[#3987FF]/20 text-[#82B7FF] border-[#3987FF]/40',
  'Example': 'bg-[#9B8CFF]/20 text-[#C2B6FF] border-[#9B8CFF]/40',
  'Definition': 'bg-[#35C98A]/20 text-[#7FE5B6] border-[#35C98A]/40',
  'Formula': 'bg-[#FFB454]/20 text-[#FFD199] border-[#FFB454]/40',
  'Important': 'bg-[#FF5C6C]/20 text-[#FFA3AC] border-[#FF5C6C]/40',
  'Confusing': 'bg-[#193653] text-[#82B7FF] border-[rgba(130,183,255,0.25)]',
  'Review Needed': 'bg-[#FF5C6C]/15 text-[#FF5C6C] border-[#FF5C6C]/30',
};

interface BookmarkTagPanelProps {
  segments: CaptionSegment[];
  onSegmentsUpdated: (updatedSegments: CaptionSegment[]) => void;
  onJumpToSegment: (segmentId: string) => void;
}

export const BookmarkTagPanel: React.FC<BookmarkTagPanelProps> = ({
  segments,
  onSegmentsUpdated,
  onJumpToSegment
}) => {
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [tagMenuOpenId, setTagMenuOpenId] = useState<string | null>(null);

  const toggleBookmark = useCallback((seg: CaptionSegment) => {
    const updated = { ...seg, bookmarked: !seg.bookmarked };
    saveOrUpdateSegment(updated);
    onSegmentsUpdated(segments.map(s => s.id === seg.id ? updated : s));
  }, [segments, onSegmentsUpdated]);

  const toggleTag = useCallback((seg: CaptionSegment, tag: string) => {
    const existingTags = seg.tags ?? [];
    const newTags = existingTags.includes(tag)
      ? existingTags.filter(t => t !== tag)
      : [...existingTags, tag];
    const updated = { ...seg, tags: newTags };
    saveOrUpdateSegment(updated);
    onSegmentsUpdated(segments.map(s => s.id === seg.id ? updated : s));
    setTagMenuOpenId(null);
  }, [segments, onSegmentsUpdated]);

  const filteredSegments = useMemo(() => {
    let base = segments;
    if (filterBookmarked) base = base.filter(s => s.bookmarked);
    if (filterTag) base = base.filter(s => s.tags?.includes(filterTag));
    return base;
  }, [segments, filterBookmarked, filterTag]);

  const bookmarkedCount = segments.filter(s => s.bookmarked).length;
  const taggedCount = segments.filter(s => (s.tags?.length ?? 0) > 0).length;

  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toFixed(0).padStart(2, '0')}`;

  return (
    <div className="bg-[#10243D] rounded-2xl border border-[rgba(130,183,255,0.14)] shadow-ocean-card overflow-hidden">
      {/* Header */}
      <div className="bg-[#071426] border-b border-[rgba(130,183,255,0.12)] p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-4 h-4 text-[#FFB454]" />
          <div>
            <h3 className="text-xs font-bold text-[#EAF2FF]">Bookmarks & Concept Tags</h3>
            <p className="text-[10px] font-mono text-[#6D86A8]">{bookmarkedCount} saved • {taggedCount} tagged moments</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-2.5 border-b border-[rgba(130,183,255,0.08)] bg-[#071426]/50 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterBookmarked(!filterBookmarked)}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            filterBookmarked
              ? 'bg-[#FFB454]/20 text-[#FFB454] border-[#FFB454]/40'
              : 'bg-[#152C48] text-[#A9BCD4] border-[rgba(130,183,255,0.12)] hover:text-[#EAF2FF]'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Bookmarked</span>
        </button>

        <div className="relative">
          <select
            value={filterTag ?? ''}
            onChange={e => setFilterTag(e.target.value || null)}
            className="text-xs border border-[rgba(130,183,255,0.18)] rounded-lg px-2.5 py-1 bg-[#152C48] text-[#EAF2FF] focus:outline-none focus:border-[#3987FF]"
          >
            <option value="" className="bg-[#071426]">All Tags</option>
            {TAG_OPTIONS.map(t => (
              <option key={t} value={t} className="bg-[#071426]">{t}</option>
            ))}
          </select>
        </div>

        {(filterBookmarked || filterTag) && (
          <button
            onClick={() => { setFilterBookmarked(false); setFilterTag(null); }}
            className="flex items-center space-x-1 text-xs text-[#6D86A8] hover:text-[#EAF2FF]"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}

        <span className="ml-auto text-[10px] font-mono text-[#6D86A8]">
          {filteredSegments.length}/{segments.length}
        </span>
      </div>

      {/* Segments with Bookmark & Tag Controls */}
      <div className="divide-y divide-[rgba(130,183,255,0.06)] max-h-[440px] overflow-y-auto">
        {filteredSegments.length === 0 ? (
          <div className="py-10 text-center text-[#6D86A8]">
            <Bookmark className="w-8 h-8 mx-auto mb-2 text-[#193653]" />
            <p className="text-xs font-semibold">No segments match current filter.</p>
          </div>
        ) : (
          filteredSegments.map(seg => (
            <div key={seg.id} className="px-4 py-3 hover:bg-[#152C48]/60 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <button
                      onClick={() => onJumpToSegment(seg.id)}
                      className="text-[11px] font-mono font-bold text-[#82B7FF] hover:underline shrink-0"
                    >
                      [{fmtTime(seg.startSeconds)}]
                    </button>
                    {/* Tag Chips */}
                    <div className="flex flex-wrap gap-1">
                      {(seg.tags ?? []).map(tag => (
                        <span
                          key={tag}
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] ?? 'bg-[#193653] text-[#A9BCD4] border-[rgba(130,183,255,0.2)]'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#A9BCD4] leading-relaxed line-clamp-2">
                    {seg.correctedText || seg.originalText}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-1 shrink-0">
                  {/* Tag menu */}
                  <div className="relative">
                    <button
                      onClick={() => setTagMenuOpenId(tagMenuOpenId === seg.id ? null : seg.id)}
                      className="p-1.5 text-[#6D86A8] hover:text-[#82B7FF] rounded-lg hover:bg-[#193653] transition-colors"
                      title="Add / remove tag"
                    >
                      <Tag className="w-3.5 h-3.5" />
                    </button>

                    {tagMenuOpenId === seg.id && (
                      <div className="absolute right-0 top-8 z-30 bg-[#071426] border border-[rgba(130,183,255,0.2)] rounded-xl shadow-ocean-elevated p-2 min-w-[170px] space-y-1">
                        {TAG_OPTIONS.map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(seg, tag)}
                            className={`w-full text-left text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                              seg.tags?.includes(tag)
                                ? 'bg-[#3987FF]/20 text-[#82B7FF] font-bold'
                                : 'text-[#A9BCD4] hover:bg-[#152C48] hover:text-[#EAF2FF]'
                            }`}
                          >
                            <span>{tag}</span>
                            {seg.tags?.includes(tag) && <Check className="w-3 h-3 text-[#3987FF]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bookmark toggle */}
                  <button
                    onClick={() => toggleBookmark(seg)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      seg.bookmarked
                        ? 'text-[#FFB454] bg-[#FFB454]/15 hover:bg-[#FFB454]/25'
                        : 'text-[#6D86A8] hover:text-[#FFB454] hover:bg-[#193653]'
                    }`}
                    title={seg.bookmarked ? 'Remove bookmark' : 'Bookmark this moment'}
                  >
                    {seg.bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
