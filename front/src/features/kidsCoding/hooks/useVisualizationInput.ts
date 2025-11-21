import { useEffect, useRef } from 'react';
import type { InputEventDTO } from '@/features/kidsCoding/types/input';
import type { VisualizationFrame } from '@/features/kidsCoding/types/visualization';

interface Params {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  frame?: VisualizationFrame;
  sendInput: (event: InputEventDTO) => void;
  enabled?: boolean;
}

export function useVisualizationInput({ canvasRef, frame, sendInput, enabled = true }: Params) {
  const isPointerActive = useRef(false);
  const seqRef = useRef(1);

  useEffect(() => {
    if (!enabled) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const buildPosition = (evt: PointerEvent | WheelEvent): Pick<InputEventDTO, 'x' | 'y' | 'relX' | 'relY'> => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return {};
      const relX = (evt.clientX - rect.left) / rect.width;
      const relY = (evt.clientY - rect.top) / rect.height;
      const x = frame?.width ? relX * frame.width : undefined;
      const y = frame?.height ? relY * frame.height : undefined;
      return {
        relX: clampRatio(relX),
        relY: clampRatio(relY),
        x: clampCoord(x),
        y: clampCoord(y),
      };
    };

    const send = (event: Omit<InputEventDTO, 'seq'>) => {
      sendInput({ ...event, seq: seqRef.current++ });
    };

    const handlePointerDown = (evt: PointerEvent) => {
      isPointerActive.current = true;
      send({
        type: 'mousedown',
        button: evt.button,
        timestamp: Date.now(),
        ...buildPosition(evt),
        modifiers: getModifiers(evt),
      });
    };

    const handlePointerUp = (evt: PointerEvent) => {
      send({
        type: 'mouseup',
        button: evt.button,
        timestamp: Date.now(),
        ...buildPosition(evt),
        modifiers: getModifiers(evt),
      });
    };

    const handlePointerMove = (evt: PointerEvent) => {
      if (!isPointerActive.current) return;
      send({
        type: 'mousemove',
        timestamp: Date.now(),
        ...buildPosition(evt),
        deltaX: evt.movementX,
        deltaY: evt.movementY,
        modifiers: getModifiers(evt),
      });
    };

    const handleWheel = (evt: WheelEvent) => {
      if (!isPointerActive.current) return;
      send({
        type: 'wheel',
        timestamp: Date.now(),
        deltaX: evt.deltaX,
        deltaY: evt.deltaY,
        ...buildPosition(evt),
        modifiers: getModifiers(evt),
      });
    };

    const handlePointerLeave = () => {
      isPointerActive.current = false;
    };

    const handleKey = (evt: KeyboardEvent, type: 'keydown' | 'keyup' | 'keypress') => {
      if (!isPointerActive.current) return;
      send({
        type,
        key: evt.key,
        code: evt.code,
        keyCode: evt.keyCode,
        timestamp: Date.now(),
        modifiers: getModifiers(evt),
      });
    };

    const keyDownHandler = (evt: KeyboardEvent) => handleKey(evt, 'keydown');
    const keyUpHandler = (evt: KeyboardEvent) => handleKey(evt, 'keyup');
    const keyPressHandler = (evt: KeyboardEvent) => handleKey(evt, 'keypress');

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('keypress', keyPressHandler);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener('keypress', keyPressHandler);
    };
  }, [canvasRef, frame, enabled, sendInput]);
}

const clampCoord = (value?: number) => {
  if (!Number.isFinite(value)) return undefined;
  return Math.max(-10000, Math.min(10000, Math.trunc(value as number)));
};

const clampRatio = (value?: number) => {
  if (!Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(1, value as number));
};

const getModifiers = (evt: KeyboardEvent | PointerEvent | WheelEvent): InputEventDTO['modifiers'] => ({
  shift: evt.shiftKey,
  alt: evt.altKey,
  ctrl: evt.ctrlKey,
  meta: evt.metaKey,
});
