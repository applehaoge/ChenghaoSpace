import { useEffect, useMemo, useRef } from 'react';
import type { VisualizationFrame } from '@/features/kidsCoding/types/visualization';

type VisualizationViewerProps = {
  frame?: VisualizationFrame;
  isDark?: boolean;
  className?: string;
};

export function VisualizationViewer({ frame, isDark, className }: VisualizationViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const statusText = useMemo(() => {
    if (!frame) return '等待程序生成可视化输出';
    const timestamp = frame.timestamp ? new Date(frame.timestamp * 1000).toLocaleTimeString() : '';
    return timestamp ? `最新帧 · ${timestamp}` : '正在绘制';
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

  return (
    <div
      className={className}
      style={{
        background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(241,245,249,0.7)',
        borderRadius: 24,
        border: isDark ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(191,219,254,0.8)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-400">
        <span className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
          <i className="fa-solid fa-wave-square text-blue-500" />
          {statusText}
        </span>
      </div>
      <div className="relative px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300/70 dark:border-slate-600/70 bg-black/80">
          {frame ? (
            <canvas ref={canvasRef} className="block h-auto w-full" />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-sm text-slate-400 dark:text-slate-500">
              <i className="fa-solid fa-display text-2xl opacity-70" />
              <span>运行支持可视化的代码即可在此看到画面</span>
            </div>
          )}
        </div>
      </div>
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
