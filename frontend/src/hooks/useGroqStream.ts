import { useState, useCallback, useRef } from 'react';
import { sendInterviewMessage } from '../lib/api';
import { useIntelliMockStore } from '../store/intellimockStore';

interface UseGroqStreamReturn {
  streamedText: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
  startStream: (sessionId: string, userMessage: string, metrics?: any) => Promise<void>;
  reset: () => void;
}

export function useGroqStream(): UseGroqStreamReturn {
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const setStreaming = useIntelliMockStore((s) => s.setStreaming);

  const reset = useCallback(() => {
    setStreamedText('');
    setIsStreaming(false);
    setIsComplete(false);
    setError(null);
  }, []);

  const startStream = useCallback(async (sessionId: string, userMessage: string, metrics?: any) => {
    reset();
    setIsStreaming(true);
    setStreaming(true);

    try {
      const stream = await sendInterviewMessage(sessionId, userMessage, metrics);
      if (!stream) throw new Error('No stream received');

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content || '';
              if (token) {
                accumulated += token;
                setStreamedText(accumulated);

                // Detect interview completion signal
                if (accumulated.includes('INTELLIMOCK_COMPLETE')) {
                  setIsComplete(true);
                }
              }
            } catch (e) {
              // Ignore incomplete JSON or non-JSON data lines
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stream failed');
    } finally {
      setIsStreaming(false);
      setStreaming(false);
    }
  }, [reset, setStreaming]);

  return { streamedText, isStreaming, isComplete, error, startStream, reset };
}
