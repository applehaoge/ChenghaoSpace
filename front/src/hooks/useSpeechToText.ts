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
  const silenceTimerRef = useRef<number | null>(null);
  const SILENCE_TIMEOUT_MS = 2500;

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
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = event => {
      const transcript = Array.from(event.results)
        .map(result => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      if (transcript) {
        onResult(transcript);
      }
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = window.setTimeout(() => {
        recognitionRef.current?.stop();
      }, SILENCE_TIMEOUT_MS);
    };

    recognition.onerror = event => {
      const message = event.error === 'not-allowed' ? '浏览器拒绝访问麦克风' : `语音识别失败：${event.error}`;
      setError(message);
      setStatus('error');
      recognitionRef.current = null;
      onError?.(message);
    };

    recognition.onstart = () => {
      setError(null);
      setStatus('recording');
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = window.setTimeout(() => {
        recognitionRef.current?.stop();
      }, SILENCE_TIMEOUT_MS);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setStatus(prev => (prev === 'unsupported' ? prev : 'idle'));
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
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

      recognitionRef.current = recognition;
      recognition.start();
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '启动语音识别失败';
      setError(message);
      setStatus('error');
      recognitionRef.current = null;
      onError?.(message);
    }
  }, [createRecognition, onError, status]);

  const stop = useCallback(() => {
    if (status !== 'recording') return;
    recognitionRef.current?.stop();
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, [status]);

  return {
    status,
    error,
    isSupported: status !== 'unsupported',
    start,
    stop,
  };
}
