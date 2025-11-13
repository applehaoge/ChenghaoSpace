import clsx from 'clsx';
import { useEffect, useMemo, useRef } from 'react';
import type { VisualizationFrame } from '@/features/kidsCoding/types/visualization';

type VisualizationViewerProps = {
  frame?: VisualizationFrame;
  isDark?: boolean;
  className?: string;
};

export function VisualizationViewer({ frame, isDark, className }: VisualizationViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const aspectRatio = useMemo(() => {
    if (!frame || frame.height === 0) return 16 / 9;
    return frame.width / frame.height;
  }, [frame]);

  useEffect(() => {
    if (!frame) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = frame;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = convertFrameToImageData(frame);
    ctx.putImageData(imageData, 0, 0);
  }, [frame]);

  const containerClass = clsx(
    'relative w-full overflow-hidden rounded-2xl border transition-all duration-200',
    isDark ? 'bg-black/80 border-blue-500/40' : 'bg-slate-50 border-blue-200',
    className,
  );

  return (
    <div className={containerClass}>
      {frame ? (
        <div className="relative w-full" style={{ paddingBottom: `${100 / aspectRatio}%` }}>
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-48 flex-col items-center justify-center gap-3 text-sm text-slate-400 dark:text-slate-500">
          <i className="fa-solid fa-display text-2xl opacity-70" />
          <span>运行支持可视化的代码即可在此看到画面</span>
        </div>
      )}
    </div>
  );
}

function convertFrameToImageData(frame: VisualizationFrame): ImageData {
  const { width, height, data } = frame;
  const raw = decodeBase64(data);
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, j = 0; i < raw.length; i += 3, j += 4) {
    rgba[j] = raw[i];
    rgba[j + 1] = raw[i + 1];
    rgba[j + 2] = raw[i + 2];
    rgba[j + 3] = 255;
  }
  return new ImageData(rgba, width, height);
}

function decodeBase64(source: string): Uint8Array {
  if (typeof atob === 'function') {
    const binary = atob(source);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      array[i] = binary.charCodeAt(i);
    }
    return array;
  }
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(source, 'base64'));
  }
  throw new Error('Base64 decoding is not supported in this environment');
}
