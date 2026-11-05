import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Mail, CheckCircle2, AlertCircle, ArrowRight, 
  Sparkles, ShieldCheck, Lock, ExternalLink, RefreshCw, 
  School, BookOpen, Award, Check, UserCheck, KeyRound, LogOut
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  getCurrentUser, saveCurrentUser, loginDirectGoogle, 
  createMagicVerification, getPendingVerification, verifyMagicToken, 
  logoutUser, PendingVerification 
} from '../utils/storage';

interface ClassroomLoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onContinueAsGuest?: () => void;
}

export const ClassroomLoginPage: React.FC<ClassroomLoginPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check URL query parameters for ?verify=TOKEN&email=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify');
    if (token) {
      const verified = verifyMagicToken(token);
      if (verified) {
        setCurrentUser(verified);
        setSuccessMessage(`Welcome back, ${verified.name}! Email verified.`);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => onLoginSuccess(verified), 800);
      }
    } else {
      const pending = getPendingVerification();
      if (pending) {
        setPendingVerification(pending);
      }
    }
  }, [onLoginSuccess]);

  // Handle direct Google 1-Click login
  const handleGoogleLogin = () => {
    setIsSending(true);
    setErrorMessage(null);
    setTimeout(() => {
      const user = loginDirectGoogle(fullName || 'Dhruv Scholar', email || 'student.researcher@gmail.com');
      setCurrentUser(user);
      setIsSending(false);
      setSuccessMessage('Successfully signed in with Google. All lecture data preserved!');
      setTimeout(() => onLoginSuccess(user), 600);
    }, 450);
  };

  // Handle sending email verification link
  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail or academic email address.');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    setTimeout(() => {
      const record = createMagicVerification(email);
      setPendingVerification(record);
      setIsSending(false);
      setSuccessMessage(`Magic verification link dispatched to ${email}!`);
    }, 500);
  };

  // Handle clicking the magic link in the simulated inbox
  const handleVerifyClick = (tokenToVerify?: string) => {
    const token = tokenToVerify || inputToken || pendingVerification?.token;
    if (!token) {
      setErrorMessage('Verification token missing. Please try again.');
      return;
    }

    const verified = verifyMagicToken(token);
    if (verified) {
      setCurrentUser(verified);
      setPendingVerification(null);
      setSuccessMessage(`Authentication successful! Welcome to the classroom, ${verified.name}.`);
      setTimeout(() => onLoginSuccess(verified), 700);
    } else {
      setErrorMessage('Invalid or expired verification link. Please request a new link.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setPendingVerification(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 flex flex-col justify-center max-w-4xl mx-auto">
      
      {/* Classroom Academic Card - White with Blackboard & Gold Accents */}
      <div className="bg-[#FFFFFF] text-[#0F172A] rounded-3xl shadow-2xl border-4 border-[#0F172A] overflow-hidden relative">
        
        {/* Top Blackboard Banner Header */}
        <div className="bg-[#0B1320] text-[#FFFFFF] p-6 sm:p-8 border-b-4 border-[#EAB308] relative overflow-hidden">
          {/* Subtle gold chalk line & glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EAB308] via-[#F59E0B] to-[#EAB308]" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EAB308] to-[#CA8A04] flex items-center justify-center text-[#0F172A] shadow-md border border-[#FEF08A]">
                <GraduationCap className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#FACC15] text-[11px] font-mono uppercase tracking-wider font-bold mb-1">
                  <span>CLASSROOM THEATER 101</span>
                  <span>•</span>
                  <span>STUDENT VAULT</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#FFFFFF] tracking-tight font-serif">
                  Academic Lecture Authentication
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-[#E2E8F0] bg-white/[0.08] px-3.5 py-1.5 rounded-xl border border-white/20">
              <ShieldCheck className="w-4 h-4 text-[#EAB308]" />
              <span>Data Preservation Enabled</span>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm mt-3 max-w-2xl font-light">
            Sign in to securely synchronize lecture transcripts, audio scrubbing timestamps, Cornell structured notes, and student error corrections across any device.
          </p>
        </div>

        {/* Inner Content Area */}
        <div className="p-6 sm:p-10 bg-[#FAFAFA]">
          
          {/* If already logged in, show student ID profile card */}
          {currentUser ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#EAB308] text-[#0F172A] font-bold text-[10px] font-mono px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Verified Scholar
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                  <img
                    src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=scholar'}
                    alt="Avatar"
                    className="w-20 h-20 rounded-2xl border-2 border-[#EAB308] shadow-md bg-[#0F172A]/5"
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl font-bold text-[#0F172A] font-serif">
                        {currentUser.name}
                      </h2>
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-semibold">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>Preserved & Active</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 font-mono flex items-center justify-center sm:justify-start space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#EAB308]" />
                      <span>{currentUser.email}</span>
                      <span>•</span>
                      <span className="capitalize">{currentUser.provider} Auth</span>
                    </div>

                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <div className="flex items-center space-x-1">
                        <School className="w-3.5 h-3.5 text-slate-400" />
                        <span>{currentUser.institution || 'Department of Biological Sciences'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{(currentUser.enrolledCourses || ['Biology 201', 'Physics 204']).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleLogout}
                  className="btn-3d-obsidian inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Switch Account / Sign Out</span>
                </button>

                <button
                  onClick={() => onLoginSuccess(currentUser)}
                  className="btn-3d-cyan inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-extrabold shadow-3d-button"
                >
                  <span>Enter Lecture Hall Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Option 1: Direct Google Login */}
              <div className="bg-white p-6 rounded-2xl border-2 border-[#E2E8F0] shadow-sm space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
                    <span>INSTANT 1-CLICK ACCESS</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                    Direct Google Account Sign-In
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Connect instantly with your Google account. Automatically synchronizes all previous classroom recordings, benchmark terms, and notes with zero wait time.
                  </p>

                  <div className="pt-2">
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Student Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dhruv Scholar"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:border-[#EAB308] focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isSending}
                    className="w-full inline-flex items-center justify-center space-x-3 px-5 py-3 rounded-xl bg-white hover:bg-amber-50/50 text-[#0F172A] font-bold text-xs sm:text-sm border-2 border-slate-200 hover:border-[#EAB308] shadow-sm hover:shadow-md transition-all group"
                  >
                    {/* Google G Icon */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Sign in with Google</span>
                    <ArrowRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Option 2: Gmail / Email Magic Verification Link */}
              <div className="bg-white p-6 rounded-2xl border-2 border-[#E2E8F0] shadow-sm space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-mono font-bold">
                    <Mail className="w-3.5 h-3.5 text-[#EAB308]" />
                    <span>PASSWORDLESS EMAIL LINK</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                    Sign in with Gmail / Email
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter your email to receive an instant verification link. Click the link in your inbox to verify and enter your private student vault.
                  </p>
                </div>

                <form onSubmit={handleSendMagicLink} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Email Address (Gmail or Campus)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:border-[#EAB308] focus:bg-white font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="btn-3d-gold w-full inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-extrabold shadow-md transition-all"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#1A1303]" />
                        <span>Sending Verification Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-[#1A1303]" />
                        <span>Send Magic Verification Link</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Simulated Incoming Email Notification Card when magic link is dispatched */}
                {pendingVerification && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border-2 border-[#EAB308] text-xs space-y-3 animate-fade-in shadow-inner">
                    <div className="flex items-center justify-between text-[#854D0E] font-bold">
                      <span className="flex items-center space-x-1.5 font-mono">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Email Dispatched to Inbox</span>
                      </span>
                      <span className="text-[10px] bg-[#EAB308] text-[#0F172A] px-2 py-0.5 rounded font-mono font-bold">
                        Token: {pendingVerification.token}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-200 text-[#0F172A] space-y-2">
                      <div className="text-[11px] text-slate-500 font-mono">
                        From: <span className="font-semibold text-slate-700">LectureLoop Academic Registrar &lt;verify@lectureloop.edu&gt;</span>
                      </div>
                      <div className="font-semibold text-xs">
                        Subject: 🎓 Your Verification Link for LectureLoop
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Hello scholar! Click the button below to confirm your email and access your saved lecture recordings.
                      </p>
                      
                      {/* Interactive Verification Button */}
                      <button
                        type="button"
                        onClick={() => handleVerifyClick(pendingVerification.token)}
                        className="btn-3d-emerald w-full py-2.5 px-3 text-xs flex items-center justify-center space-x-2 shadow-md transition-all font-extrabold"
                      >
                        <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                        <span>Verify Email & Enter Lecture Hall</span>
                      </button>
                    </div>

                    {/* Or enter code manually */}
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value)}
                        placeholder="Or enter 6-char code"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono uppercase bg-white text-slate-800 font-bold focus:border-[#EAB308] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyClick()}
                        className="btn-3d-obsidian px-3.5 py-1.5 text-xs font-bold text-cyan-glow"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-300 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Guest / Bypass Link */}
          {onContinueAsGuest && (
            <div className="mt-8 pt-5 border-t border-slate-200 text-center">
              <button
                onClick={onContinueAsGuest}
                className="text-xs text-slate-500 hover:text-[#0F172A] font-semibold underline underline-offset-4 transition-colors"
              >
                Continue as Guest (Preview without syncing saved profile) →
              </button>
            </div>
          )}

        </div>

        {/* Classroom Blackboard Footer */}
        <div className="bg-[#0B1320] text-slate-400 px-6 py-3 border-t-2 border-[#EAB308] text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[#EAB308]">
            <Award className="w-3.5 h-3.5" />
            <span>BIOS SEED BUILD LAB • BT-14 HACKATHON BENCHMARK CERTIFIED</span>
          </div>
          <div>
            100% Offline Provenance • No External Cloud Key Dependency
          </div>
        </div>

      </div>

    </div>
  );
};
