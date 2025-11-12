export type VisualizationPixelFormat = 'RGB';

export interface VisualizationFrame {
  width: number;
  height: number;
  format: VisualizationPixelFormat;
  data: string; // base64 encoded pixel values
  timestamp?: number;
}

export interface VisualizationSnapshot {
  latestFrame?: VisualizationFrame;
}
