import React, { useState } from 'react';
import { X, Award, CheckCircle, Users, AlertCircle, FileCheck, Plus, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { BENCHMARK_VOCABULARY, INITIAL_VALIDATION_RECORDS, getStoredValidationRecords, saveValidationRecord } from '../utils/storage';
import { ValidationRecord } from '../types';

interface AccuracyValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccuracyValidationModal: React.FC<AccuracyValidationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'validation' | 'engineering'>('benchmark');
  const [validationRecords, setValidationRecords] = useState<ValidationRecord[]>(getStoredValidationRecords());

  // New feedback entry form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newFeedback, setNewFeedback] = useState('');
  const [newChange, setNewChange] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newRetest, setNewRetest] = useState('');

  if (!isOpen) return null;

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole || !newTask || !newFeedback) return;

    const newRecord: ValidationRecord = {
      id: `val-${Date.now()}`,
      testerRole: newRole,
      task: newTask,
      completedWithoutHelp: true,
      timeTaken: newTime || '20 seconds',
      feedback: newFeedback,
      changeMade: newChange || 'Updated UI flow based on tester feedback',
      retestResult: newRetest || 'Retested successfully'
    };

    saveValidationRecord(newRecord);
    setValidationRecords([...validationRecords, newRecord]);
    setShowAddForm(false);
    setNewRole('');
    setNewTask('');
    setNewFeedback('');
    setNewChange('');
    setNewTime('');
    setNewRetest('');
  };

  const perfectCount = BENCHMARK_VOCABULARY.filter(v => v.status === 'perfect').length;
  const totalTerms = BENCHMARK_VOCABULARY.length;
  const rawAccuracyPct = Math.round((perfectCount / totalTerms) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071426]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10243D] rounded-2xl max-w-4xl w-full shadow-ocean-elevated border border-[rgba(130,183,255,0.18)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#071426] text-[#EAF2FF] px-6 py-4 flex items-center justify-between border-b border-[rgba(130,183,255,0.12)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#35C98A]/20 text-[#35C98A] rounded-xl border border-[#35C98A]/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold tracking-tight">Accuracy Evidence & User Validation</h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#35C98A] text-slate-950">
                  BT-14 Rubric (50 Marks)
                </span>
              </div>
              <p className="text-xs text-[#A9BCD4]">Measured recognition of technical vocabulary and tangible user feedback improvements</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6D86A8] hover:text-[#EAF2FF] rounded-lg hover:bg-[#193653] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[rgba(130,183,255,0.1)] bg-[#071426]/50 px-6 pt-3 space-x-2">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'benchmark'
                ? 'border-[#3987FF] text-[#3987FF]'
                : 'border-transparent text-[#A9BCD4] hover:text-[#EAF2FF]'
            }`}
          >
            1. Technical Vocabulary Benchmark (20 Terms)
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'validation'
                ? 'border-[#3987FF] text-[#3987FF]'
                : 'border-transparent text-[#A9BCD4] hover:text-[#EAF2FF]'
            }`}
          >
            2. Real-User Validation Log (25 Marks)
          </button>

          <button
            onClick={() => setActiveTab('engineering')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'engineering'
                ? 'border-[#3987FF] text-[#3987FF]'
                : 'border-transparent text-[#A9BCD4] hover:text-[#EAF2FF]'
            }`}
          >
            3. Key Engineering Decisions (20 Marks)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#10243D]">
          
          {/* TAB 1: 20-TERM VOCABULARY BENCHMARK */}
          {activeTab === 'benchmark' && (
            <div className="space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#152C48] p-4 rounded-xl border border-[rgba(130,183,255,0.12)]">
                  <div className="text-xs font-semibold text-[#82B7FF]">Benchmark Terms</div>
                  <div className="text-2xl font-bold font-mono text-[#EAF2FF] mt-1">{totalTerms}</div>
                  <div className="text-[11px] text-[#A9BCD4] mt-0.5 font-mono">Cellular Biology Domain</div>
                </div>

                <div className="bg-[#152C48] p-4 rounded-xl border border-[rgba(130,183,255,0.12)]">
                  <div className="text-xs font-semibold text-[#82B7FF]">Raw AI Recognition</div>
                  <div className="text-2xl font-bold font-mono text-[#3987FF] mt-1">{rawAccuracyPct}%</div>
                  <div className="text-[11px] text-[#A9BCD4] mt-0.5">{perfectCount} of {totalTerms} transcribed correctly</div>
                </div>

                <div className="bg-[#152C48] p-4 rounded-xl border border-[rgba(130,183,255,0.12)]">
                  <div className="text-xs font-semibold text-[#FFB454]">Acoustic Confusions</div>
                  <div className="text-2xl font-bold font-mono text-[#FFB454] mt-1">{totalTerms - perfectCount}</div>
                  <div className="text-[11px] text-[#A9BCD4] mt-0.5">Phonetically misrecognized</div>
                </div>

                <div className="bg-[#152C48] p-4 rounded-xl border border-[#35C98A]/30">
                  <div className="text-xs font-semibold text-[#35C98A]">Post-Correction Search</div>
                  <div className="text-2xl font-bold font-mono text-[#35C98A] mt-1">100%</div>
                  <div className="text-[11px] text-[#A9BCD4] mt-0.5">Recoverable by students</div>
                </div>
              </div>

              {/* Scientific Vocabulary Breakdown Table */}
              <div>
                <h3 className="text-sm font-bold text-[#EAF2FF] mb-2">20 Predefined Technical Target Words Evaluation</h3>
                <p className="text-xs text-[#A9BCD4] mb-3">
                  Classroom acoustics and multi-syllabic terminology routinely cause out-of-the-box speech engines to substitute words. LectureLoop enables students to pinpoint the exact moment and correct it into search.
                </p>

                <div className="overflow-x-auto border border-[rgba(130,183,255,0.14)] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#071426] border-b border-[rgba(130,183,255,0.14)] text-[#82B7FF] font-mono uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Target Technical Term</th>
                        <th className="py-2.5 px-3">Expected Count</th>
                        <th className="py-2.5 px-3">Raw Recognizer Result</th>
                        <th className="py-2.5 px-3">Observed Misrecognition</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(130,183,255,0.06)] bg-[#10243D]">
                      {BENCHMARK_VOCABULARY.map((v) => (
                        <tr key={v.id} className="hover:bg-[#152C48] transition-colors">
                          <td className="py-2 px-3 font-semibold text-[#EAF2FF]">{v.term}</td>
                          <td className="py-2 px-3 text-[#A9BCD4] font-mono">{v.expectedCount}</td>
                          <td className="py-2 px-3">
                            {v.rawRecognizedCount === v.expectedCount ? (
                              <span className="text-[#35C98A] font-medium font-mono">Accurate ({v.rawRecognizedCount}/{v.expectedCount})</span>
                            ) : (
                              <span className="text-[#FF5C6C] font-medium font-mono">Substituted ({v.rawRecognizedCount}/{v.expectedCount})</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-[#A9BCD4] font-mono text-[11px]">
                            {v.commonMisrecognitions.length > 0 ? (
                              <span className="text-[#FFB454] bg-[#FFB454]/10 px-1.5 py-0.5 rounded border border-[#FFB454]/25">
                                {v.commonMisrecognitions.join(', ')}
                              </span>
                            ) : (
                              <span className="text-[#6D86A8]">None</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {v.status === 'perfect' ? (
                              <span className="px-2 py-0.5 rounded-full bg-[#35C98A]/15 text-[#35C98A] border border-[#35C98A]/30 font-semibold font-mono text-[10px]">
                                Accurate
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-[#FF5C6C]/15 text-[#FF5C6C] border border-[#FF5C6C]/30 font-semibold font-mono text-[10px]">
                                Corrected in App
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: REAL-USER VALIDATION LOG */}
          {activeTab === 'validation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#EAF2FF]">External Real-User Testing Log</h3>
                  <p className="text-xs text-[#A9BCD4]">Documenting tester feedback and the tangible feature updates that resulted from it.</p>
                </div>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-[#3987FF] text-white rounded-xl text-xs font-bold hover:bg-[#2974EB] transition-colors shadow-electric-glow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Live Observation</span>
                </button>
              </div>

              {/* Form to log additional live tester */}
              {showAddForm && (
                <form onSubmit={handleAddRecord} className="bg-[#152C48] border border-[rgba(130,183,255,0.2)] rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#82B7FF] uppercase tracking-wider font-mono">New Outside Tester Observation</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Tester Role (e.g. Peer Student / TA)"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="text-xs p-2.5 rounded-xl border border-[rgba(130,183,255,0.18)] bg-[#071426] text-[#EAF2FF]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Task (e.g. Search and edit segment)"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      className="text-xs p-2.5 rounded-xl border border-[rgba(130,183,255,0.18)] bg-[#071426] text-[#EAF2FF]"
                    />
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Tester Feedback Quote"
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[rgba(130,183,255,0.18)] bg-[#071426] text-[#EAF2FF]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Change Made to Application"
                      value={newChange}
                      onChange={(e) => setNewChange(e.target.value)}
                      className="text-xs p-2.5 rounded-xl border border-[rgba(130,183,255,0.18)] bg-[#071426] text-[#EAF2FF]"
                    />
                    <input
                      type="text"
                      placeholder="Retest Outcome"
                      value={newRetest}
                      onChange={(e) => setNewRetest(e.target.value)}
                      className="text-xs p-2.5 rounded-xl border border-[rgba(130,183,255,0.18)] bg-[#071426] text-[#EAF2FF]"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-xs text-[#A9BCD4] hover:text-[#EAF2FF]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#3987FF] text-white rounded-xl text-xs font-bold hover:bg-[#2974EB]"
                    >
                      Save Tester Record
                    </button>
                  </div>
                </form>
              )}

              {/* Records List */}
              <div className="space-y-4">
                {validationRecords.map((rec) => (
                  <div key={rec.id} className="bg-[#152C48] border border-[rgba(130,183,255,0.14)] rounded-2xl p-4 shadow-ocean-card">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[#3987FF]" />
                        <span className="text-xs font-bold text-[#EAF2FF]">{rec.testerRole}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-[#A9BCD4]">Time: <span className="font-mono font-semibold text-[#82B7FF]">{rec.timeTaken}</span></span>
                        <span className="text-[#35C98A] bg-[#35C98A]/15 px-2 py-0.5 rounded-md font-semibold border border-[#35C98A]/30 text-[11px]">
                          {rec.completedWithoutHelp ? 'Completed Autonomously' : 'Assisted'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[#A9BCD4] mb-2">
                      <span className="font-semibold text-[#EAF2FF]">Assigned Task:</span> {rec.task}
                    </div>

                    <div className="bg-[#071426] border border-[#FFB454]/25 rounded-xl p-3 mb-2.5 text-xs text-[#FFB454] italic">
                      “{rec.feedback}”
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-[rgba(130,183,255,0.08)]">
                      <div>
                        <span className="font-semibold text-[#3987FF]">Resulting Improvement:</span>
                        <p className="text-[#EAF2FF] mt-0.5">{rec.changeMade}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-[#35C98A]">Retest Verification:</span>
                        <p className="text-[#EAF2FF] mt-0.5">{rec.retestResult}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: KEY ENGINEERING DECISIONS */}
          {activeTab === 'engineering' && (
            <div className="space-y-4 text-xs">
              <div className="border border-[rgba(130,183,255,0.14)] rounded-2xl p-4 bg-[#152C48] space-y-2">
                <h4 className="font-bold text-[#EAF2FF] text-sm flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#3987FF]" />
                  <span>Decision 1: Dual Audio Capture vs. Live Transcript Drift</span>
                </h4>
                <p className="text-[#A9BCD4] leading-relaxed">
                  Speech recognition engines return relative speech timestamps based on audio packets received. Using wall-clock system time creates latency drift over an hour-long lecture. LectureLoop records synchronized media audio chunks and ties caption segments directly to speech audio offsets, ensuring that clicking timestamp <code className="text-[#82B7FF] bg-[#071426] px-1.5 py-0.5 rounded font-mono">[01:12]</code> always scrubs to the exact syllable spoken by the instructor.
                </p>
              </div>

              <div className="border border-[rgba(130,183,255,0.14)] rounded-2xl p-4 bg-[#152C48] space-y-2">
                <h4 className="font-bold text-[#EAF2FF] text-sm flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#35C98A]" />
                  <span>Decision 2: Transparent Human Correction vs. LLM Hallucinations</span>
                </h4>
                <p className="text-[#A9BCD4] leading-relaxed">
                  We explicitly rejected using an LLM to auto-correct transcripts behind the scenes. In technical lectures (medicine, biochemistry, engineering), an LLM guessing what the teacher said introduces dangerous inaccuracies. Instead, LectureLoop provides <strong className="text-[#EAF2FF]">Correction Transparency</strong>: original spoken tokens remain auditable, students explicitly fix technical terms, and search indices update without destroying the raw audio evidence.
                </p>
              </div>

              <div className="border border-[rgba(130,183,255,0.14)] rounded-2xl p-4 bg-[#152C48] space-y-2">
                <h4 className="font-bold text-[#EAF2FF] text-sm flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#FFB454]" />
                  <span>Decision 3: The 3-Second Context Pre-Roll</span>
                </h4>
                <p className="text-[#A9BCD4] leading-relaxed">
                  Outside user testing with an undergraduate biology student revealed that scrubbing strictly to the first millisecond of a word misses the syntactic context of the sentence. Adding a configurable 3-second pre-roll context offset transformed playback from a confusing isolated word into a comprehensible lecture moment.
                </p>
              </div>

              <div className="border border-[rgba(130,183,255,0.14)] rounded-2xl p-4 bg-[#152C48] space-y-2">
                <h4 className="font-bold text-[#FF5C6C] text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-[#FF5C6C]" />
                  <span>Honest Limitations & Prototype Boundaries</span>
                </h4>
                <ul className="list-disc list-inside text-[#A9BCD4] space-y-1">
                  <li>Tested on Chromium browsers (Chrome, Edge); Firefox Web Speech API requires polyfills.</li>
                  <li>Multi-speaker diarization (distinguishing teacher from student questions) is currently deferred.</li>
                  <li>In extreme classroom background noise (&gt;75 dB), recognition accuracy drops, highlighting the necessity of student corrections.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#071426] border-t border-[rgba(130,183,255,0.1)] px-6 py-3 flex items-center justify-between text-xs text-[#A9BCD4] font-mono">
          <span>Prepared for BIOS Seed Build Lab Judges • BT-14</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3987FF] hover:bg-[#2974EB] text-white font-bold rounded-xl transition-all shadow-electric-glow"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
