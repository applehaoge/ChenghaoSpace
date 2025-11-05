import { useState, useEffect, useRef, useCallback } from 'react';

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

    const recognition = new SpeechRecognitionCtor() as SpeechRecognitionLike;
    recognition.lang = lang;
    recognition.continuous = false;
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
    };

    recognition.onerror = event => {
      const message = event.error === 'not-allowed' ? '浏览器拒绝访问麦克风' : `语音识别失败：${event.error}`;
      setError(message);
      setStatus('error');
      onError?.(message);
    };

    recognition.onstart = () => {
      setError(null);
      setStatus('recording');
    };

    recognition.onend = () => {
      setStatus(prev => (prev === 'unsupported' ? prev : 'idle'));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [lang, onResult, onError]);

  const start = useCallback(() => {
    if (!recognitionRef.current || status === 'unsupported') {
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (err) {
      const message = err instanceof Error ? err.message : '启动语音识别失败';
      setError(message);
      setStatus('error');
      onError?.(message);
    }
  }, [onError, status]);

  const stop = useCallback(() => {
    if (!recognitionRef.current || status !== 'recording') {
      return;
    }
    recognitionRef.current.stop();
  }, [status]);

  return {
    status,
    error,
    isSupported: status !== 'unsupported',
    start,
    stop,
  };
}
