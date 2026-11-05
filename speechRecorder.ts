// Speech and Audio Recording Engine for LectureLoop

export interface SpeechSegmentCallbackData {
  text: string;
  startSeconds: number;
  endSeconds: number;
  isFinal: boolean;
  confidence?: number;
}

export class LectureSpeechRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private recognition: any = null;
  private startTime: number = 0;
  private lastSegmentEndTime: number = 0;
  private isSimulated: boolean = false;
  private simulationTimer: any = null;
  private simulationIndex: number = 0;

  // Classroom simulation script (used if microphone is unavailable or chosen by user)
  private simulationScript = [
    { text: "Good morning class. Today we will thoroughly examine photosynthesis inside the living plant cell.", duration: 7 },
    { text: "Solar energy is captured inside specialized double-membrane organelles termed chloroplasts.", duration: 6 },
    { text: "Suspended within the stroma is a dense stack of flattened sacs called the thylakoid system.", duration: 7 },
    { text: "Embedded in these membranes are green pigment clusters known as chlorophyll molecules.", duration: 6 },
    { text: "When light activates photosystem two, electrons get excited, initiating photophosphorylation across the chain.", duration: 8 },
    { text: "Simultaneously, water undergoes photolysis, discharging free protons and oxygen into the inner lumen.", duration: 7 },
    { text: "This proton gradient drives the molecular motor ATP-synthase to produce cellular energy.", duration: 6 },
    { text: "High-energy electrons reduce NADP-plus into NADPH with the electron shuttle ferredoxin.", duration: 6 },
    { text: "Now in the stroma's Calvin-cycle, the primary enzyme RuBisCO fixes atmospheric carbon dioxide.", duration: 8 },
    { text: "RuBisCO carboxylates ribulose-1,5-bisphosphate into 3-phosphoglycerate and glyceraldehyde-3-phosphate.", duration: 9 }
  ];

  constructor(
    private onInterim: (text: string) => void,
    private onFinalSegment: (data: SpeechSegmentCallbackData) => void,
    private onError: (errorMsg: string) => void
  ) {}

  public async startRealMicrophone(): Promise<boolean> {
    this.isSimulated = false;
    this.audioChunks = [];
    this.startTime = Date.now();
    this.lastSegmentEndTime = 0;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup MediaRecorder for real audio replay
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');

      this.mediaRecorder = mimeType ? new MediaRecorder(this.mediaStream, { mimeType }) : new MediaRecorder(this.mediaStream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      this.mediaRecorder.start(1000); // 1-second chunks

      // Setup Web Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        this.onError("Browser SpeechRecognition not natively supported in this browser. Falling back to simulated speech stream.");
        this.startSimulation();
        return true;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence || 0.9;
          
          if (event.results[i].isFinal) {
            const currentSeconds = Math.max(1, (Date.now() - this.startTime) / 1000);
            const start = this.lastSegmentEndTime;
            const end = currentSeconds;
            this.lastSegmentEndTime = end;

            this.onFinalSegment({
              text: transcript.trim(),
              startSeconds: Math.round(start * 10) / 10,
              endSeconds: Math.round(end * 10) / 10,
              isFinal: true,
              confidence
            });
            this.onInterim('');
          } else {
            interimTranscript += transcript;
          }
        }
        if (interimTranscript) {
          this.onInterim(interimTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          this.onError("Microphone permission denied. Switch to simulated mode to test captions.");
        }
      };

      this.recognition.onend = () => {
        // If recording is still active and media stream is open, restart recognition
        if (this.mediaStream && this.mediaStream.active && !this.isSimulated) {
          try {
            this.recognition?.start();
          } catch (e) {
            // Already started or finished
          }
        }
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.warn("Could not access real microphone:", err);
      this.onError(`Microphone error (${err.message || 'permission blocked'}). Activating classroom simulator.`);
      this.startSimulation();
      return false;
    }
  }

  public startSimulation(): void {
    this.isSimulated = true;
    this.audioChunks = [];
    this.startTime = Date.now();
    this.lastSegmentEndTime = 0;
    this.simulationIndex = 0;

    const playNextSimulated = () => {
      if (this.simulationIndex >= this.simulationScript.length) {
        this.simulationIndex = 0; // loop
      }

      const item = this.simulationScript[this.simulationIndex];
      this.simulationIndex++;

      // Emit interim typing steps to make it look authentically live
      const words = item.text.split(' ');
      let currentWordIdx = 0;

      const interimTimer = setInterval(() => {
        currentWordIdx = Math.min(words.length, currentWordIdx + 2);
        this.onInterim(words.slice(0, currentWordIdx).join(' '));

        if (currentWordIdx >= words.length) {
          clearInterval(interimTimer);
          const currentSeconds = Math.max(1, (Date.now() - this.startTime) / 1000);
          const start = this.lastSegmentEndTime;
          const end = currentSeconds;
          this.lastSegmentEndTime = end;

          this.onFinalSegment({
            text: item.text,
            startSeconds: Math.round(start * 10) / 10,
            endSeconds: Math.round(end * 10) / 10,
            isFinal: true,
            confidence: 0.91
          });
          this.onInterim('');

          // Schedule next sentence
          this.simulationTimer = setTimeout(playNextSimulated, 2000);
        }
      }, 400);
    };

    this.simulationTimer = setTimeout(playNextSimulated, 500);
  }

  public async stop(): Promise<{ audioBlob: Blob | null; durationSeconds: number }> {
    const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
      this.simulationTimer = null;
    }

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const finalBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
          resolve({ audioBlob: finalBlob, durationSeconds });
        };
        try {
          this.mediaRecorder.stop();
        } catch (e) {
          resolve({ audioBlob: null, durationSeconds });
        }
      } else {
        // Simulated or fallback: generate a synthetic WAV audio blob for playback
        import('./audioGenerator').then(({ createWavBlob }) => {
          const syntheticBlob = createWavBlob(durationSeconds, 440);
          resolve({ audioBlob: syntheticBlob, durationSeconds });
        });
      }
    });
  }
}
