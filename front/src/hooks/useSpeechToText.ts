import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechStatus = 'idle' | 'recording' | 'unsupported' | 'error';

type UseSpeechToTextOptions = {
  onResult: (text: string) => void;
  onError?: (message: string) => void;
  lang?: string;
};

type SpeechRecognitionLike = SpeechRecognition & {
  lang?: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useSpeechToText({
  onResult,
  onError,
  lang = 'zh-CN',
}: UseSpeechToTextOptions) {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const ctorRef = useRef<typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition | null>(null);
  const manualStopRef = useRef(false);
  const transcriptRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      setStatus('unsupported');
      return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setStatus('unsupported');
      return;
    }

    ctorRef.current = SpeechRecognitionCtor;

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const createRecognition = useCallback(() => {
    const SpeechRecognitionCtor = ctorRef.current;
    if (!SpeechRecognitionCtor) return null;

    const recognition = new SpeechRecognitionCtor() as SpeechRecognitionLike;
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = event => {
      if (manualStopRef.current) {
        return;
      }
      const combined = Array.from(event.results)
        .map(result => result[0]?.transcript ?? '')
        .join('')
        .replace(/\s+/g, ' ')
        .trim();

      if (!combined) return;

      const previous = transcriptRef.current;
      let addition = combined;
      if (combined.startsWith(previous)) {
        addition = combined.slice(previous.length);
      }
      addition = addition.replace(/\s+/g, ' ').trim();

      if (addition) {
        onResult(addition);
      }
      transcriptRef.current = combined;
    };

    recognition.onerror = event => {
      const message = event.error === 'not-allowed' ? 'ä¯ÀÀÆ÷¾Ü¾ø·ÃÎÊÂó¿Ë·ç' : `ÓïÒôÊ¶±ðÊ§°Ü£º${event.error}`;
      manualStopRef.current = true;
      setError(message);
      setStatus('error');
      recognitionRef.current = null;
      onError?.(message);
    };

    recognition.onstart = () => {
      manualStopRef.current = false;
      transcriptRef.current = '';
      setError(null);
      setStatus('recording');
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setStatus(prev => (prev === 'unsupported' ? prev : 'idle'));
      manualStopRef.current = false;
    };

    return recognition;
  }, [lang, onError, onResult]);

  const start = useCallback(() => {
    if (status === 'unsupported') return;
    if (status === 'recording') return;

    try {
      recognitionRef.current?.abort?.();
      recognitionRef.current?.stop();
      recognitionRef.current = null;

      const recognition = createRecognition();
      if (!recognition) {
        setStatus('unsupported');
        return;
      }

      transcriptRef.current = '';
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Æô¶¯ÓïÒôÊ¶±ðÊ§°Ü';
      manualStopRef.current = true;
      setError(message);
      setStatus('error');
      recognitionRef.current = null;
      onError?.(message);
    }
  }, [createRecognition, onError, status]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    transcriptRef.current = '';
  }, []);

  return {
    status,
    error,
    isSupported: status !== 'unsupported',
    start,
    stop,
  };
}

