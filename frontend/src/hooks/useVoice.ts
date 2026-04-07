import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSpeaking: boolean;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSupported: boolean;
  error: string | null;
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const intentionalStopRef = useRef(false);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      } else if (interimTranscript) {
        setTranscript(prev => {
          // Only update with interim if we haven't already added a final
          const base = prev;
          return base + interimTranscript;
        });
      }

      // Reset retry count on successful result
      retryCountRef.current = 0;

      // Reset silence timer — auto-stop after 2.5s of silence
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = window.setTimeout(() => {
        intentionalStopRef.current = true;
        recognition.stop();
        setIsListening(false);
      }, 2500);
    };

    recognition.onerror = (event) => {
      const errorType = event.error;

      // Handle recoverable errors with retry
      if ((errorType === 'network' || errorType === 'aborted' || errorType === 'audio-capture') && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setError(`Reconnecting... (attempt ${retryCountRef.current}/${maxRetries})`);
        
        // Retry after a short delay
        setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
            setError(null);
          } catch {
            // If retry fails, try recreating the recognition instance
            const newRecognition = createRecognition();
            if (newRecognition) {
              recognitionRef.current = newRecognition;
              try {
                newRecognition.start();
                setIsListening(true);
                setError(null);
              } catch {
                setError('Microphone unavailable. Please check permissions.');
                setIsListening(false);
              }
            }
          }
        }, 500 * retryCountRef.current); // Exponential-ish backoff
        return;
      }

      // Non-recoverable or exhausted retries
      if (errorType === 'not-allowed') {
        setError('Microphone access denied. Please allow mic permissions in your browser settings.');
      } else if (errorType === 'network') {
        setError('Speech service unavailable. Use Chrome/Edge on HTTPS for voice features.');
      } else if (errorType === 'no-speech') {
        setError(null); // No speech is not really an error — just silence
        return;
      } else {
        setError(`Voice error: ${errorType}. Try refreshing the page.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      // Only set isListening to false if we intentionally stopped
      if (intentionalStopRef.current) {
        setIsListening(false);
        intentionalStopRef.current = false;
      }
    };

    return recognition;
  }, [isSupported]);

  // Initialize recognition
  useEffect(() => {
    const recognition = createRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        intentionalStopRef.current = true;
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [createRecognition]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      // Try to recreate if null
      const newRecognition = createRecognition();
      if (!newRecognition) {
        setError('Speech recognition not supported in this browser. Use Chrome or Edge.');
        return;
      }
      recognitionRef.current = newRecognition;
    }
    
    setTranscript('');
    setError(null);
    retryCountRef.current = 0;
    intentionalStopRef.current = false;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      if (err?.message?.includes('already started')) {
        // Already running — just reset state
        setIsListening(true);
      } else {
        // Recreate and try again
        const newRecognition = createRecognition();
        if (newRecognition) {
          recognitionRef.current = newRecognition;
          try {
            newRecognition.start();
            setIsListening(true);
          } catch {
            setError('Failed to start voice input. Please refresh and try again.');
          }
        }
      }
    }
  }, [createRecognition]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    intentionalStopRef.current = true;
    recognitionRef.current.stop();
    setIsListening(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, []);

  // ─── Speech Synthesis (TTS) ───
  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Chrome has a bug where synthesis stops after ~15s. Split long text.
    synthRef.current.cancel();
    
    const maxChunkLength = 200;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let current = '';
    
    for (const sentence of sentences) {
      if ((current + sentence).length > maxChunkLength && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    let chunkIndex = 0;
    
    const speakChunk = () => {
      if (chunkIndex >= chunks.length) {
        setIsSpeaking(false);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      utterance.rate = 1.05;
      utterance.pitch = 1;
      
      // Try to get a natural-sounding voice
      const voices = synthRef.current?.getVoices() || [];
      const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) 
        || voices.find(v => v.lang.startsWith('en-'));
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        chunkIndex++;
        speakChunk();
      };
      utterance.onerror = () => {
        chunkIndex++;
        speakChunk();
      };
      
      synthRef.current?.speak(utterance);
    };
    
    // Chrome requires voices to be loaded first
    if (synthRef.current.getVoices().length === 0) {
      synthRef.current.addEventListener('voiceschanged', () => speakChunk(), { once: true });
    } else {
      speakChunk();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    isSupported,
    error,
  };
}
