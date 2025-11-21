import type { InputEventDTO } from './types.js';
import { config } from '../config.js';

interface JobStreamMessage {
  event?: { type?: string; input?: InputEventDTO };
}

export interface JobStreamInputClient {
  dispose: () => void;
}

const resolveWsUrl = (path: string) => {
  const url = new URL(path, config.serverUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};

export function createJobStreamInputClient(
  jobId: string,
  onInput: (event: InputEventDTO) => void,
): JobStreamInputClient {
  let closed = false;
  let ws: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;

  const scheduleReconnect = () => {
    if (closed || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, 500);
  };

  const handleMessage = (data: WebSocketEventMap['message']['data']) => {
    try {
      const parsed = JSON.parse(typeof data === 'string' ? data : data.toString()) as JobStreamMessage;
      if (parsed?.event?.type === 'input' && parsed.event.input) {
        onInput(parsed.event.input);
      }
    } catch (error) {
      console.warn('[runner] Failed to parse job stream message', error);
    }
  };

  const connect = () => {
    if (closed) return;
    try {
      ws = new WebSocket(resolveWsUrl(`/api/run/${jobId}/stream`));
    } catch (error) {
      console.warn('[runner] Failed to open job stream socket', error);
      scheduleReconnect();
      return;
    }

    ws.onmessage = event => handleMessage(event.data);
    ws.onerror = () => {
      ws?.close();
    };
    ws.onclose = () => {
      ws = null;
      scheduleReconnect();
    };
  };

  connect();

  return {
    dispose: () => {
      closed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      ws?.close();
    },
  };
}
